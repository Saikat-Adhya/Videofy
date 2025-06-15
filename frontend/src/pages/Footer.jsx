import React from "react";

const Footer = () => {
  return (
    <footer className="bg-base-200 text-base-content text-sm w-full">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="text-center md:text-left space-y-1">
          <p className="font-semibold text-base">Saikat Adhya</p>
          <p>
            Email:{" "}
            <a
              href="mailto:support@learningvideofy.tech"
              className="text-primary hover:underline"
            >
              support@learningvideofy.tech
            </a>
          </p>
          <p>Made with ❤️ by Saikat Adhya <span>(2025)</span></p>
        </div>

        <div className="text-center md:text-right space-y-1">
          <a
            href="https://www.linkedin.com/in/saikat-adhya-53b7452a9/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline block"
          >
            LinkedIn Profile
          </a>
          <a
            href="https://github.com/Saikat-Adhya"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline block"
          >
            GitHub Profile
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
