import React from "react";
import { MdLocationOn } from "react-icons/md";
import { FiPhone, FiMail } from "react-icons/fi";
import { FaFacebook, FaTwitter, FaLinkedinIn, FaGithub } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-700 text-white px-6 pt-8 pb-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-12 px-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <div className="flex items-center">
            <MdLocationOn className="h-5 w-5" />
            <span className="ml-2 font-medium">Addis Ababa, Ethiopia</span>
          </div>
          <div className="flex items-center">
            <FiPhone className="h-5 w-5" />
            <span className="ml-2 font-medium">+251993592990</span>
          </div>
          <div className="flex items-center">
            <FiMail className="h-5 w-5" />
            <a
              href="mailto:biniyambiyadge@gmail.com"
              className="ml-2 font-medium hover:underline text-blue-400"
            >
              biniyambiyadge@gmail.com
            </a>
          </div>
        </div>

        {/* About & Socials */}
        <div className="space-y-3 max-w-md">
          <h3 className="text-lg font-semibold">About Binios Estate</h3>
          <p className="text-sm text-gray-300">
            Binios Estate is a trusted real estate agency in Ethiopia,
            specializing in premium apartments, residential homes, and
            commercial properties.
          </p>
          <p className="text-sm">Connect with us on:</p>
          <div className="flex space-x-4 text-xl">
            <a href="#" aria-label="Facebook" className="hover:text-blue-400">
              <FaFacebook />
            </a>
            <a
              href="https://x.com/abuabu5929"
              aria-label="Twitter"
              className="hover:text-blue-400"
            >
              <FaTwitter />
            </a>
            <a
              href="https://www.linkedin.com/in/biniyam-biyadge/"
              aria-label="LinkedIn"
              className="hover:text-blue-500"
            >
              <FaLinkedinIn />
            </a>
            <a
              href="https://github.com/Binaa10"
              aria-label="GitHub"
              className="hover:text-blue-500"
            >
              <FaGithub />
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-600 my-6" />

      {/* Copyright */}
      <div className="text-center text-sm text-gray-300">
        © {currentYear} Binios Estate. All rights reserved.
      </div>
    </footer>
  );
}
