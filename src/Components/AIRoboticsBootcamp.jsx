import React from "react";

function AIRoboticsBootcamp() {
  return (
    <div className="min-h-screen bg-black text-white">

      {/* Hero */}
      <section className="pt-28 pb-20 px-6 text-center bg-gradient-to-b from-zinc-900 to-black">

        <div className="max-w-5xl mx-auto">

          <span className="inline-block px-4 py-2 rounded-full bg-cyan-400/10 border border-cyan-400 text-cyan-400 mb-6">
            🤖 AI Robotics BootCamp 2026
          </span>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Build Your First
            <br />
            <span className="bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              AI Powered Robot
            </span>
          </h1>

          <p className="text-zinc-400 text-xl mt-6 max-w-3xl mx-auto">
            Learn robotics, artificial intelligence, computer vision and automation
            through practical hands-on projects.
          </p>

          <button
            className="
            mt-10 px-10 py-4 
            bg-gradient-to-r from-cyan-400 to-purple-600
            text-black font-bold rounded-2xl
            hover:scale-105 transition
            "
          >
            Join BootCamp ₹499
          </button>

        </div>

      </section>


      {/* Program Details */}

      <section className="py-20 px-6">

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">


          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-700">
            <h3 className="text-2xl font-bold mb-3">
              Duration
            </h3>

            <p className="text-zinc-400">
              4 Days Online Training
            </p>
          </div>



          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-700">

            <h3 className="text-2xl font-bold mb-3">
              Mode
            </h3>

            <p className="text-zinc-400">
              Live Online Classes
            </p>

          </div>



          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-700">

            <h3 className="text-2xl font-bold mb-3">
              Certificate
            </h3>

            <p className="text-zinc-400">
              Completion Certificate Included
            </p>

          </div>


        </div>

      </section>



      {/* What you learn */}

      <section className="py-20 bg-zinc-900 px-6">

        <div className="max-w-5xl mx-auto">

          <h2 className="text-5xl font-bold text-center mb-12">
            What You Will Learn
          </h2>


          <div className="grid md:grid-cols-2 gap-6">


          {
            [
              "Introduction to Robotics",
              "AI based automation",
              "Computer Vision basics",
              "Robot simulation",
              "Sensors and IoT",
              "Building intelligent systems"
            ].map((item,index)=>(
              <div
              key={index}
              className="
              bg-zinc-800
              p-6
              rounded-2xl
              border border-zinc-700
              "
              >
                🚀 {item}

              </div>
            ))
          }


          </div>


        </div>

      </section>



      {/* CTA */}

      <section className="py-24 text-center">

        <h2 className="text-5xl font-bold">
          Ready to Build The Future?
        </h2>

        <p className="text-zinc-400 mt-5">
          Limited seats available
        </p>


        <button
        className="
        mt-8 px-12 py-5
        bg-white text-black
        rounded-2xl
        font-bold
        "
        >
          Register Now
        </button>


      </section>


    </div>
  );
}


export default AIRoboticsBootcamp;
