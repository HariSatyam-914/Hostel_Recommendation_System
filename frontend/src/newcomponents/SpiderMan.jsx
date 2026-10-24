// import React from "react";
// import { motion } from "framer-motion";

// function SpiderMan({ target }) {

//   // Spider's position on the screen
//   const spiderX = 30;
//   const spiderY = window.innerHeight - 45;

//   // Before a navbar button is clicked
//   if (!target) {
//     return (
//       <div className="fixed bottom-5 left-5 z-50">
//         <div className="text-6xl">
//           🕷️
//         </div>
//       </div>
//     );
//   }

//   // Difference between Spider-Man and clicked button
//   const dx = target.x - spiderX;
//   const dy = target.y - spiderY;

//   // Distance between Spider-Man and clicked button
//   const distance = Math.sqrt(
//     dx * dx + dy * dy
//   );

//   // Angle at which the web should point
//   const angle =
//     Math.atan2(dy, dx) * (180 / Math.PI);

//   return (
//     <div className="fixed inset-0 pointer-events-none z-50">

//       {/* Web */}
//       <motion.div
//         className="absolute h-1 bg-gray-200 origin-left"
//         style={{
//           left: spiderX,
//           top: spiderY,
//           rotate: angle,
//         }}
//         initial={{
//           width: 0,
//         }}
//         animate={{
//           width: distance,
//         }}
//         transition={{
//           duration: 0.7,
//           ease: "easeOut",
//         }}
//       />

//       {/* Spider */}
//       <div
//         className="absolute text-6xl"
//         style={{
//           left: spiderX - 30,
//           top: spiderY - 30,
//         }}
//       >
//         🕷️
//       </div>

//     </div>
//   );
// }

// export default SpiderMan;


// latest 
import React from "react";
import { motion } from "framer-motion";

function SpiderMan({ target, phase }) {

    const spiderX = 30;
    const spiderY = window.innerHeight - 45;

    if (!target) {
        return (
            <div className="fixed bottom-5 left-5 z-50">
                <div className="text-6xl">
                    🕷️
                </div>
            </div>
        );
    }

    const dx = target.x - spiderX;
    const dy = target.y - spiderY;

    const distance = Math.sqrt(
        dx * dx + dy * dy
    );

    const angle =
        Math.atan2(dy, dx) * (180 / Math.PI);

    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">

            <div
                className="absolute text-6xl"
                style={{
                    left: spiderX - 30,
                    top: spiderY - 30
                }}
            >
                🕷️
            </div>

            <motion.div
                className="absolute h-1 bg-gray-200 origin-left"
                style={{
                    left: spiderX,
                    top: spiderY,
                    rotate: angle
                }}

                initial={{
                    width: 0
                }}

                animate={
                    phase === "shoot"
                        ? { width: distance }
                        : { width: 0 }
                }

                transition={{
                    duration:
                        phase === "shoot"
                            ? 0.7
                            : 0.8,

                    ease: "easeInOut"
                }}
            />

        </div>
    );
}

export default SpiderMan;