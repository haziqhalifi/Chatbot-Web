import os
import json
import pickle
from typing import List, Dict, Any
import PyPDF2
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from config import EMBEDDING_MODEL, RAG_SETTINGS, PERFORMANCE_SETTINGS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global embedding model cache
_embedding_model = None

def get_embedding_model():
    """Get cached embedding model"""
    global _embedding_model
    if _embedding_model is None:
        logger.info(f"Loading embedding model: {EMBEDDING_MODEL}")
        _embedding_model = SentenceTransformer(EMBEDDING_MODEL)
        logger.info("Embedding model loaded successfully")
    return _embedding_model

class RAGSystem:
    def __init__(self, documents_path: str = None, embeddings_file: str = "embeddings.pkl"):
        """
        Initialize RAG system
        
        Args:
            documents_path: Path to the directory containing PDF files
            embeddings_file: Path to store/load embeddings
        """
        if documents_path is None:
            # Default to frontend public/file directory
            self.documents_path = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                "frontend", "public", "file"
            )
        else:
            self.documents_path = documents_path
            
        self.embeddings_file = embeddings_file
        # Use cached multilingual model for better performance
        if PERFORMANCE_SETTINGS.get("cache_embeddings_model", True):
            self.model = get_embedding_model()
        else:
            self.model = SentenceTransformer(EMBEDDING_MODEL)
        self.documents = []
        self.embeddings = None
        self.chunk_size = RAG_SETTINGS.get("chunk_size", 500)  # Characters per chunk
        self.overlap = RAG_SETTINGS.get("overlap", 50)      # Overlap between chunks
        
        logger.info(f"RAG System initialized with documents path: {self.documents_path}")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from a PDF file"""
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                text = ""
                for page in reader.pages:
                    text += page.extract_text() + "\n"
                return text
        except Exception as e:
            logger.error(f"Error extracting text from {pdf_path}: {str(e)}")
            return ""
    
    def chunk_text(self, text: str, filename: str) -> List[Dict[str, Any]]:
        """Split text into overlapping chunks"""
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + self.chunk_size
            chunk = text[start:end]
            
            # Try to break at word boundaries
            if end < len(text):
                last_space = chunk.rfind(' ')
                if last_space != -1:
                    chunk = chunk[:last_space]
                    end = start + last_space
            
            if chunk.strip():  # Only add non-empty chunks
                chunks.append({
                    'text': chunk.strip(),
                    'source': filename,
                    'start_pos': start,
                    'end_pos': end
                })
            
            start = end - self.overlap
            
        return chunks
    
    def load_documents(self) -> List[Dict[str, Any]]:
        """Load and process all PDF documents"""
        documents = []
        
        if not os.path.exists(self.documents_path):
            logger.warning(f"Documents path does not exist: {self.documents_path}")
            return documents
        
        pdf_files = [f for f in os.listdir(self.documents_path) if f.endswith('.pdf')]
        logger.info(f"Found {len(pdf_files)} PDF files")
        
        for filename in pdf_files:
            pdf_path = os.path.join(self.documents_path, filename)
            logger.info(f"Processing: {filename}")
            
            text = self.extract_text_from_pdf(pdf_path)
            if text:
                chunks = self.chunk_text(text, filename)
                documents.extend(chunks)
                logger.info(f"Created {len(chunks)} chunks from {filename}")
        
        logger.info(f"Total chunks created: {len(documents)}")
        return documents
    
    def create_embeddings(self) -> np.ndarray:
        """Create embeddings for all document chunks"""
        if not self.documents:
            logger.warning("No documents loaded")
            return np.array([])
        
        texts = [doc['text'] for doc in self.documents]
        logger.info(f"Creating embeddings for {len(texts)} chunks...")
        
        embeddings = self.model.encode(texts, show_progress_bar=True)
        logger.info(f"Created embeddings with shape: {embeddings.shape}")
        
        return embeddings
    
    def save_embeddings(self):
        """Save documents and embeddings to file"""
        data = {
            'documents': self.documents,
            'embeddings': self.embeddings
        }
        
        with open(self.embeddings_file, 'wb') as f:
            pickle.dump(data, f)
            logger.info(f"Saved embeddings to {self.embeddings_file}")
    
    def load_embeddings(self) -> bool:
        """Load documents and embeddings from file"""
        if not os.path.exists(self.embeddings_file):
            return False
        
        try:
            with open(self.embeddings_file, 'rb') as f:
                data = pickle.load(f)
            
            self.documents = data['documents']
            self.embeddings = data['embeddings']
            
            logger.info(f"Loaded {len(self.documents)} documents and embeddings from {self.embeddings_file}")
            return True
        except Exception as e:
            logger.error(f"Error loading embeddings: {str(e)}")
            return False
    
    def initialize_or_update(self, force_rebuild: bool = False):
        """Initialize the RAG system or update if needed"""
        if not force_rebuild and self.load_embeddings():
            # Check if we need to update (simple check - can be improved)
            if os.path.exists(self.documents_path):
                pdf_files = [f for f in os.listdir(self.documents_path) if f.endswith('.pdf')]
                existing_sources = set(doc['source'] for doc in self.documents)
                
                if set(pdf_files) == existing_sources:
                    logger.info("Embeddings are up to date")
                    return
        
        logger.info("Building/rebuilding embeddings...")
        self.documents = self.load_documents()
        if self.documents:
            self.embeddings = self.create_embeddings()
            self.save_embeddings()
        else:
            logger.warning("No documents found to process")
    
    def retrieve_relevant_chunks(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        """Retrieve the most relevant document chunks for a query"""
        if not self.documents or self.embeddings is None:
            logger.warning(f"No documents ({len(self.documents) if self.documents else 0}) or embeddings available")
            return []
        
        logger.info(f"RAG: Processing query '{query[:50]}...' against {len(self.documents)} document chunks")
        
        # Create query embedding
        query_embedding = self.model.encode([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_embedding, self.embeddings)[0]
        
        # Log similarity scores
        max_similarity = np.max(similarities) if len(similarities) > 0 else 0
        logger.info(f"RAG: Max similarity score: {max_similarity:.3f}")
        
        # Check if similarity is above threshold
        similarity_threshold = PERFORMANCE_SETTINGS.get("rag_similarity_threshold", 0.3)
        if max_similarity < similarity_threshold:
            logger.info(f"RAG: Max similarity {max_similarity:.3f} below threshold {similarity_threshold}, returning empty context")
            return []
        
        # Get top-k most similar chunks
        top_indices = np.argsort(similarities)[-top_k:][::-1]
        
        relevant_chunks = []
        for idx in top_indices:
            chunk = self.documents[idx].copy()
            chunk['similarity'] = similarities[idx]
            relevant_chunks.append(chunk)
        
        logger.info(f"Retrieved {len(relevant_chunks)} relevant chunks for query: {query[:50]}...")
        for i, chunk in enumerate(relevant_chunks):
            logger.info(f"Chunk {i+1} - Similarity: {chunk['similarity']:.3f}, Source: {chunk.get('source', 'unknown')}")
        
        return relevant_chunks
    
    def get_context_for_query(self, query: str, max_context_length: int = 1500) -> str:
        """Get formatted context for a query"""
        relevant_chunks = self.retrieve_relevant_chunks(query, top_k=RAG_SETTINGS.get("top_k_chunks", 3))
        
        if not relevant_chunks:
            return ""
        
        context_parts = []
        current_length = 0
        
        for chunk in relevant_chunks:
            chunk_text = f"From {chunk['source']}:\n{chunk['text']}\n"
            
            if current_length + len(chunk_text) > max_context_length:
                break
                
            context_parts.append(chunk_text)
            current_length += len(chunk_text)
        
        context = "\n---\n".join(context_parts)
        return context

# Global RAG instance
rag_system = None

def get_rag_system() -> RAGSystem:
    """Get or create global RAG system instance"""
    global rag_system
    if rag_system is None:
        rag_system = RAGSystem()
        rag_system.initialize_or_update()
    return rag_system

def initialize_rag():
    """Initialize the RAG system"""
    logger.info("Initializing RAG system...")
    get_rag_system()

def retrieve_context(query: str) -> str:
    """Retrieve relevant context for a query"""
    rag = get_rag_system()
    return rag.get_context_for_query(query, max_context_length=RAG_SETTINGS.get("max_context_length", 1500))
