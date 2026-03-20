import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import logo from  '/logo/JIS Logo Circular.png';

export default function SplashScreen({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2800);
    const hideTimer = setTimeout(() => setVisible(false), 3300);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return <>{children}</>;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:ital,wght@0,300;0,400;1,300&family=Tenor+Sans&display=swap');

        /* Mobile only */
        .splash-root {
          display: none !important;
        }

        @media (max-width: 767px) {
          .splash-root {
            display: flex !important;
          }
        }

        /* Logo: fade up */
        .logo-wrap {
          opacity: 0;
          transform: translateY(20px);
          animation: logoUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
        }
        @keyframes logoUp {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Divider line: expand from center */
        .divider-line {
          width: 0;
          height: 1px;
          background: #1a1a1a;
          animation: lineExpand 0.7s cubic-bezier(0.4, 0, 0.2, 1) 1.0s forwards;
        }
        @keyframes lineExpand {
          to { width: 56px; }
        }

        /* Institute name */
        .name-text {
          opacity: 0;
          animation: textFade 0.7s ease 1.3s forwards;
        }

        /* Tagline */
        .tagline-text {
          opacity: 0;
          animation: textFade 0.7s ease 1.6s forwards;
        }

        @keyframes textFade {
          to { opacity: 1; }
        }

        /* Whole screen fade out */
        .splash-fadeout {
          opacity: 0;
          transition: opacity 0.5s ease;
        }
      `}</style>

      {/* Splash — mobile only */}
      <Box
        className={`splash-root${fadeOut ? " splash-fadeout" : ""}`}
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          bgcolor: "#ffffff",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
        }}
      >
        {/* Logo placeholder */}
        <Box
          className="logo-wrap"
          sx={{
            width: 112,
            height: 112,
            mb: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            overflow: "hidden",
          }}
        >
          <img src={logo} alt="JJ Institute" style={{ width: "100%", height: "100%", objectFit: "contain" }} />

          {/* <Box
            sx={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              border: "1.5px dashed #ccc",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography sx={{ fontSize: 11, color: "#bbb", fontFamily: "Tenor Sans, sans-serif", letterSpacing: 1 }}>
              LOGO
            </Typography>
          </Box> */}
        </Box>

        {/* Expanding divider */}
        <Box className="divider-line" />

        {/* Institute name */}
        <Typography
          className="name-text"
          sx={{
            fontFamily: "'Tenor Sans', sans-serif",
            fontWeight: 400,
            fontSize: "13px",
            letterSpacing: "5px",
            color: "#1a1a1a",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.8,
            mt: "16px",
          }}
        >
          JJ Institute<br />of Science
        </Typography>

        {/* Tagline */}
        <Typography
          className="tagline-text"
          sx={{
            fontFamily: "'Cormorant', serif",
            fontWeight: 300,
            fontStyle: "italic",
            fontSize: "13.5px",
            letterSpacing: "1.5px",
            color: "#777",
            mt: "10px",
            textAlign: "center",
          }}
        >
          In the Pursuit of Excellence
        </Typography>
      </Box>

      {/* Children rendered behind splash */}
      <Box sx={{ visibility: "hidden", position: "fixed", inset: 0 }}>
        {children}
      </Box>
    </>
  );
}