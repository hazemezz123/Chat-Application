const AboutPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-base-100 text-base-content p-4">
      <div className="bg-base-200 rounded-xl shadow-lg p-8 max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-2 text-center">About Me</h1>
        <p className="text-base-content/70 text-center mb-4">
          Hi! I'm a passionate developer learning and building cool things with
          JavaScript, React, and Node.js. I love working on chat apps, exploring
          new tech, and sharing what I learn.
        </p>
        <div className="text-center">
          <span className="font-semibold">Contact:</span>{" "}
          <span className="text-base-content/70">your.email@example.com</span>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
