"""
Manual import for NADMA disaster data provided by user.
- Creates tables if missing
- Upserts disasters, categories, states, districts, and cases
- Removes redundancy by updating existing records by `id`

Run:
    python -m backend.scripts.import_nadma_manual
"""

import os
from typing import List, Dict, Any
from datetime import datetime
from dotenv import load_dotenv

# Ensure backend/.env is loaded before database modules initialize
_ENV_PATH = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(_ENV_PATH)

from backend.database.nadma import create_nadma_tables, save_disasters_batch

# --- Source data blocks (ordered by chronology) ---
# 4/1/26
DATA_2026_01_04: List[Dict[str, Any]] = [
    {
        "id": 1966,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2025-12-28 00:00:00",
        "datetime_end": None,
        "state_id": 1,
        "district_id": 9,
        "parish_id": None,
        "latitude": "2.50346000",
        "longitude": "102.82075420",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 35,
        "created_at": "2025-12-28T15:52:07.000000Z",
        "updated_at": "2025-12-28T15:52:07.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1963,
            "disaster_id": 1966,
            "district_id": 9,
            "jumlah_pps": 2,
            "jumlah_keluarga": 15,
            "jumlah_mangsa": 50,
            "created_by_id": 35,
            "status": "Aktif",
            "created_at": "2025-12-28T15:52:07.000000Z",
            "updated_at": "2026-01-04T11:52:59.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 9,
            "state_id": 1,
            "name": "Segamat",
            "latitude": "2.50346000",
            "longitude": "102.82075420",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 1,
            "name": "Johor",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1974,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-02 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 73,
        "parish_id": None,
        "latitude": "5.34556870",
        "longitude": "115.74533540",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 34,
        "created_at": "2026-01-02T14:46:59.000000Z",
        "updated_at": "2026-01-02T14:46:59.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1971,
            "disaster_id": 1974,
            "district_id": 73,
            "jumlah_pps": 1,
            "jumlah_keluarga": 118,
            "jumlah_mangsa": 328,
            "created_by_id": 34,
            "status": "Aktif",
            "created_at": "2026-01-02T14:46:59.000000Z",
            "updated_at": "2026-01-04T11:54:11.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 73,
            "state_id": 10,
            "name": "Beaufort",
            "latitude": "5.34556870",
            "longitude": "115.74533540",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1976,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-03 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 79,
        "parish_id": None,
        "latitude": "5.98436440",
        "longitude": "116.07734400",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 22,
        "created_at": "2026-01-03T21:59:50.000000Z",
        "updated_at": "2026-01-03T21:59:50.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1973,
            "disaster_id": 1976,
            "district_id": 79,
            "jumlah_pps": 1,
            "jumlah_keluarga": 46,
            "jumlah_mangsa": 182,
            "created_by_id": 22,
            "status": "Aktif",
            "created_at": "2026-01-03T21:59:50.000000Z",
            "updated_at": "2026-01-04T11:54:11.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 79,
            "state_id": 10,
            "name": "Kota Kinabalu",
            "latitude": "5.98436440",
            "longitude": "116.07734400",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    }
]

# 7/1/26 block A
DATA_2026_01_07_A: List[Dict[str, Any]] = [
    {
        "id": 1974,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-02 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 73,
        "parish_id": None,
        "latitude": "5.34556870",
        "longitude": "115.74533540",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 34,
        "created_at": "2026-01-02T14:46:59.000000Z",
        "updated_at": "2026-01-02T14:46:59.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1971,
            "disaster_id": 1974,
            "district_id": 73,
            "jumlah_pps": 4,
            "jumlah_keluarga": 223,
            "jumlah_mangsa": 661,
            "created_by_id": 34,
            "status": "Aktif",
            "created_at": "2026-01-02T14:46:59.000000Z",
            "updated_at": "2026-01-07T11:40:45.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 73,
            "state_id": 10,
            "name": "Beaufort",
            "latitude": "5.34556870",
            "longitude": "115.74533540",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1977,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-04 00:00:00",
        "datetime_end": None,
        "state_id": 11,
        "district_id": 125,
        "parish_id": None,
        "latitude": "4.05812430",
        "longitude": "113.84641340",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 23,
        "created_at": "2026-01-04T12:00:00.000000Z",
        "updated_at": "2026-01-04T12:00:00.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1974,
            "disaster_id": 1977,
            "district_id": 125,
            "jumlah_pps": 1,
            "jumlah_keluarga": 50,
            "jumlah_mangsa": 143,
            "created_by_id": 23,
            "status": "Aktif",
            "created_at": "2026-01-04T12:00:00.000000Z",
            "updated_at": "2026-01-07T11:41:53.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 125,
            "state_id": 11,
            "name": "Miri",
            "latitude": "4.39949300",
            "longitude": "113.99138320",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 11,
            "name": "Sarawak",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1980,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-05 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 99,
        "parish_id": None,
        "latitude": "5.12473140",
        "longitude": "115.94448580",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 20,
        "created_at": "2026-01-05T21:44:01.000000Z",
        "updated_at": "2026-01-05T21:44:01.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1977,
            "disaster_id": 1980,
            "district_id": 99,
            "jumlah_pps": 5,
            "jumlah_keluarga": 210,
            "jumlah_mangsa": 563,
            "created_by_id": 20,
            "status": "Aktif",
            "created_at": "2026-01-05T21:44:01.000000Z",
            "updated_at": "2026-01-07T11:40:45.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 99,
            "state_id": 10,
            "name": "Tenom",
            "latitude": "5.12473140",
            "longitude": "115.94448580",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1981,
        "kategori_id": 13,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-06 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 91,
        "parish_id": None,
        "latitude": "5.89143090",
        "longitude": "116.04849200",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 33,
        "created_at": "2026-01-06T07:57:17.000000Z",
        "updated_at": "2026-01-06T07:57:17.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 13,
            "meta_id": 1,
            "name": "Kebakaran Berskala Besar",
            "group_helper": "/images/report_ico/bencana/burning.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1978,
            "disaster_id": 1981,
            "district_id": 91,
            "jumlah_pps": 1,
            "jumlah_keluarga": 12,
            "jumlah_mangsa": 44,
            "created_by_id": 33,
            "status": "Aktif",
            "created_at": "2026-01-06T07:57:17.000000Z",
            "updated_at": "2026-01-07T07:58:41.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 91,
            "state_id": 10,
            "name": "Putatan",
            "latitude": "5.89120790",
            "longitude": "116.04852630",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    }
]

# 7/1/26 block B
DATA_2026_01_07_B: List[Dict[str, Any]] = [
    {
        "id": 1974,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-02 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 73,
        "parish_id": None,
        "latitude": "5.34556870",
        "longitude": "115.74533540",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 34,
        "created_at": "2026-01-02T14:46:59.000000Z",
        "updated_at": "2026-01-02T14:46:59.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1971,
            "disaster_id": 1974,
            "district_id": 73,
            "jumlah_pps": 3,
            "jumlah_keluarga": 153,
            "jumlah_mangsa": 408,
            "created_by_id": 34,
            "status": "Aktif",
            "created_at": "2026-01-02T14:46:59.000000Z",
            "updated_at": "2026-01-09T07:59:36.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 73,
            "state_id": 10,
            "name": "Beaufort",
            "latitude": "5.34556870",
            "longitude": "115.74533540",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1977,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-04 00:00:00",
        "datetime_end": None,
        "state_id": 11,
        "district_id": 125,
        "parish_id": None,
        "latitude": "4.05812430",
        "longitude": "113.84641340",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 23,
        "created_at": "2026-01-04T12:00:00.000000Z",
        "updated_at": "2026-01-04T12:00:00.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1974,
            "disaster_id": 1977,
            "district_id": 125,
            "jumlah_pps": 1,
            "jumlah_keluarga": 26,
            "jumlah_mangsa": 72,
            "created_by_id": 23,
            "status": "Aktif",
            "created_at": "2026-01-04T12:00:00.000000Z",
            "updated_at": "2026-01-09T08:01:48.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 125,
            "state_id": 11,
            "name": "Miri",
            "latitude": "4.39949300",
            "longitude": "113.99138320",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 11,
            "name": "Sarawak",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1982,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-09 00:00:00",
        "datetime_end": None,
        "state_id": 11,
        "district_id": 116,
        "parish_id": None,
        "latitude": "1.55337850",
        "longitude": "110.35950300",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 20,
        "created_at": "2026-01-08T21:48:12.000000Z",
        "updated_at": "2026-01-08T21:48:12.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1979,
            "disaster_id": 1982,
            "district_id": 116,
            "jumlah_pps": 2,
            "jumlah_keluarga": 37,
            "jumlah_mangsa": 151,
            "created_by_id": 20,
            "status": "Aktif",
            "created_at": "2026-01-08T21:48:12.000000Z",
            "updated_at": "2026-01-09T08:01:48.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 116,
            "state_id": 11,
            "name": "Kuching",
            "latitude": "1.55337850",
            "longitude": "110.35950300",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 11,
            "name": "Sarawak",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1983,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-09 00:00:00",
        "datetime_end": None,
        "state_id": 11,
        "district_id": 136,
        "parish_id": None,
        "latitude": "1.16703500",
        "longitude": "110.56650590",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 20,
        "created_at": "2026-01-08T21:48:35.000000Z",
        "updated_at": "2026-01-08T21:48:35.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1980,
            "disaster_id": 1983,
            "district_id": 136,
            "jumlah_pps": 5,
            "jumlah_keluarga": 65,
            "jumlah_mangsa": 235,
            "created_by_id": 20,
            "status": "Aktif",
            "created_at": "2026-01-08T21:48:35.000000Z",
            "updated_at": "2026-01-09T08:01:48.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 136,
            "state_id": 11,
            "name": "Serian",
            "latitude": "1.16703500",
            "longitude": "110.56650590",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 11,
            "name": "Sarawak",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1984,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-09 00:00:00",
        "datetime_end": None,
        "state_id": 11,
        "district_id": 130,
        "parish_id": None,
        "latitude": "1.44275730",
        "longitude": "110.49771080",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 20,
        "created_at": "2026-01-08T21:49:01.000000Z",
        "updated_at": "2026-01-08T21:49:01.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1981,
            "disaster_id": 1984,
            "district_id": 130,
            "jumlah_pps": 1,
            "jumlah_keluarga": 3,
            "jumlah_mangsa": 9,
            "created_by_id": 20,
            "status": "Aktif",
            "created_at": "2026-01-08T21:49:01.000000Z",
            "updated_at": "2026-01-09T08:01:48.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 130,
            "state_id": 11,
            "name": "Samarahan",
            "latitude": "1.44275730",
            "longitude": "110.49771080",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 11,
            "name": "Sarawak",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1985,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-09 00:00:00",
        "datetime_end": None,
        "state_id": 10,
        "district_id": 97,
        "parish_id": None,
        "latitude": "4.24465100",
        "longitude": "117.89118610",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 35,
        "created_at": "2026-01-09T03:47:48.000000Z",
        "updated_at": "2026-01-09T03:47:48.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1982,
            "disaster_id": 1985,
            "district_id": 97,
            "jumlah_pps": 1,
            "jumlah_keluarga": 20,
            "jumlah_mangsa": 95,
            "created_by_id": 35,
            "status": "Aktif",
            "created_at": "2026-01-09T03:47:48.000000Z",
            "updated_at": "2026-01-09T07:59:36.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 97,
            "state_id": 10,
            "name": "Tawau",
            "latitude": "4.24465100",
            "longitude": "117.89118610",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 10,
            "name": "Sabah",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    },
    {
        "id": 1986,
        "kategori_id": 1,
        "name": None,
        "description": None,
        "level_id": 22,
        "datetime_start": "2026-01-09 00:00:00",
        "datetime_end": None,
        "state_id": 11,
        "district_id": 137,
        "parish_id": None,
        "latitude": "2.28832670",
        "longitude": "111.83126750",
        "status": "Aktif",
        "is_backdated": 0,
        "bencana_khas": "Tidak",
        "created_by_id": 35,
        "created_at": "2026-01-09T03:53:35.000000Z",
        "updated_at": "2026-01-09T03:53:35.000000Z",
        "deleted_at": None,
        "special_report": None,
        "kategori": {
            "id": 1,
            "meta_id": 1,
            "name": "Banjir",
            "group_helper": "/images/report_ico/bencana/22.png",
            "created_at": "2024-10-31T11:54:44.000000Z",
            "updated_at": "2024-10-31T11:54:44.000000Z"
        },
        "case": {
            "id": 1983,
            "disaster_id": 1986,
            "district_id": 137,
            "jumlah_pps": 1,
            "jumlah_keluarga": 1,
            "jumlah_mangsa": 6,
            "created_by_id": 35,
            "status": "Aktif",
            "created_at": "2026-01-09T03:53:35.000000Z",
            "updated_at": "2026-01-09T08:01:48.000000Z",
            "deleted_at": None
        },
        "district": {
            "id": 137,
            "state_id": 11,
            "name": "Sibu",
            "latitude": "2.28832670",
            "longitude": "111.83126750",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "state": {
            "id": 11,
            "name": "Sarawak",
            "created_at": "2024-10-31T11:54:43.000000Z",
            "updated_at": "2024-10-31T11:54:43.000000Z"
        },
        "deaths": []
    }
]


def _augment_disaster_records(records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Ensure fields expected by saver exist (e.g., `disaster_id`)."""
    for d in records:
        # Fill `disaster_id` from top-level id if missing
        d.setdefault("disaster_id", d.get("id"))
        # Normalize None vs null semantics if needed
        # No-op: the database layer handles None appropriately via pyodbc
    return records


def main():
    print("Creating NADMA tables if missing…")
    ok = create_nadma_tables()
    if not ok:
        print("Failed to ensure tables exist. Aborting.")
        return

    # Apply in chronological order to reflect latest updates
    blocks = [DATA_2026_01_04, DATA_2026_01_07_A, DATA_2026_01_07_B]

    total_stats = {"success": 0, "failed": 0, "updated": 0, "new": 0}

    for i, block in enumerate(blocks, start=1):
        print(f"Processing block {i}/{len(blocks)} with {len(block)} records…")
        augmented = _augment_disaster_records(block)
        stats = save_disasters_batch(augmented)
        print(f"Block {i} stats: {stats}")
        for k in total_stats:
            total_stats[k] += stats.get(k, 0)

    print("Import complete.")
    print(f"Totals: {total_stats}")


if __name__ == "__main__":
    main()
