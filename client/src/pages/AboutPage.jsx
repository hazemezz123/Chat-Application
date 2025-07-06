import React from "react";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Code, Heart } from "lucide-react";

const AboutPage = () => {
  const skills = [
    "React",
    "Node.js",
    "MongoDB",
    "Socket.io",
    "TailwindCSS",
    "JavaScript",
    "TypeScript",
    "Express.js",
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 },
    },
  };

  const skillVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 to-base-200 flex items-center justify-center p-4 mt-14">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl w-full text-center"
      >
        {/* Profile Image */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.img
            src="https://i.pinimg.com/736x/98/e5/ee/98e5eeec529fabadc13657da966464d8.jpg"
            alt="Hazem's Profile"
            className="w-32 h-32 rounded-full mx-auto object-cover shadow-xl border-4 border-base-300"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>

        {/* Greeting */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl font-bold mb-4 text-base-content"
        >
          Hi, I'm Hazem{" "}
          <motion.span
            animate={{ rotate: [0, 14, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            className="inline-block"
          >
            👋
          </motion.span>
        </motion.h1>

        {/* Description */}
        <motion.div variants={itemVariants} className="mb-8 max-w-2xl mx-auto">
          <p className="text-lg text-base-content/80 leading-relaxed mb-4">
            I'm a passionate{" "}
            <span className="font-semibold text-primary">
              full-stack developer
            </span>{" "}
            who loves building real-time applications and creating seamless user
            experiences.
          </p>
          <div className="flex items-center justify-center gap-2 text-base-content/70">
            <Code className="w-4 h-4" />
            <span>Specializing in React & Node.js</span>
            <Heart className="w-4 h-4 text-red-500" />
          </div>
        </motion.div>

        {/* Skills */}
        <motion.div variants={itemVariants} className="mb-8 ">
          <h3 className="text-2xl font-semibold mb-6 text-base-content">
            Technologies I Love
          </h3>
          <motion.div
            className="flex flex-wrap justify-center gap-3 max-w-2xl mx-auto"
            variants={containerVariants}
          >
            {skills.map((skill, index) => (
              <motion.span
                key={skill}
                variants={skillVariants}
                whileHover={{
                  scale: 1.1,
                  backgroundColor: "var(--fallback-p,oklch(var(--p)/0.1))",
                }}
                className="px-4 py-2 bg-base-300 text-base-content rounded-full text-sm font-medium cursor-pointer transition-colors"
                custom={index}
              >
                {skill}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-6 max-md:flex-col max-md:items-center"
        >
          <motion.a
            href="https://github.com/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-base-300 hover:bg-base-content hover:text-base-100 rounded-lg transition-colors "
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Github className="w-5 h-5" />
            <span className="font-medium">GitHub</span>
          </motion.a>

          <motion.a
            href="https://linkedin.com/in/yourusername"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Linkedin className="w-5 h-5" />
            <span className="font-medium">LinkedIn</span>
          </motion.a>

          <motion.a
            href="mailto:your.email@example.com"
            className="flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Mail className="w-5 h-5" />
            <span className="font-medium">Email</span>
          </motion.a>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          variants={itemVariants}
          className="mt-12 text-base-content/60 text-sm"
        >
          Built with ❤️ using React, Framer Motion, and TailwindCSS
        </motion.p>
      </motion.div>
    </div>
  );
};

export default AboutPage;
