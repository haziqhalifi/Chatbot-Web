import React, { useEffect } from 'react';

const SocialLoginButtons = ({ onGoogleResponse, mode = 'signin' }) => {
  useEffect(() => {
    /* global google */
    const buttonId = mode === 'signin' ? 'google-signin-btn' : 'google-signup-btn';

    if (window.google && document.getElementById(buttonId)) {
      window.google.accounts.id.initialize({
        client_id: '845615957730-ldlb837mjkqtvigr8d6pt8ruq1qab2jo.apps.googleusercontent.com',
        callback: onGoogleResponse,
      });
      window.google.accounts.id.renderButton(document.getElementById(buttonId), {
        theme: 'outline',
        size: 'large',
        width: '100%',
      });
    }
  }, [onGoogleResponse, mode]);

  const buttonId = mode === 'signin' ? 'google-signin-btn' : 'google-signup-btn';

  return (
    <div className="space-y-3 mb-6">
      <div id={buttonId} className="w-full flex items-center justify-center"></div>
    </div>
  );
};

export default SocialLoginButtons;
