import React, { useState, useEffect, useRef } from "react";
import "./index.css";

const fixed_block_height = 68 * 4;

const Bar = (props) => {
  const [totalHeight, setTotalHeight] = useState(136);
  const [hovered, setHovered] = useState(false);
  const [bottom, setBottom] = useState(0);
  const barRef = useRef(null);
  const flashRef = useRef(null);
  const [hoveredOn, setHoveredOn] = useState("");

  useEffect(() => {
    const max = props.max;
    const total_confirmed = props.data[1];

    const percentage = total_confirmed / max;
    const totalHeight = 136 + Math.round(fixed_block_height * percentage);
    // console.log("totalHeight", totalHeight, "percentage", percentage);
    setTotalHeight(totalHeight);
  }, [totalHeight, props.data, props.max]);

  const setHoveredFlag = (e, flag) => {
    e.preventDefault();
    e.stopPropagation();
    if (
      ["BarTotal", "BarRecovered", "BarDeath"].some((x) =>
        e.target.className.includes(x)
      ) &&
      flag
    ) {
      setHoveredOn(e.target.className.split(" ")[0].replace("Bar", ""));
      setHovered(flag);
    } else if (hovered) {
      setHovered(false);
    }
  };

  const setHoveredPosition = (e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setHoveredOn(e.target.className.split(" ")[0].replace("Bar", ""));
      if (e.target.className.includes("BarTotal")) {
        setBottom(barRef.current.offsetHeight - e.nativeEvent.offsetY - 50);
      } else {
        const barDeathHeight = document.querySelector(
          `.BarDeath.${props.class_index}`
        ).offsetHeight;
        const barRecoveredHeight = document.querySelector(
          `.BarRecovered.${props.class_index}`
        ).offsetHeight;
        if (e.target.className.includes("BarRecovered")) {
          setBottom(barRecoveredHeight - e.nativeEvent.offsetY - 50);
        } else if (e.target.className.includes("BarDeath")) {
          setBottom(
            barRecoveredHeight + (barDeathHeight - e.nativeEvent.offsetY - 50)
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const heightStyle = {
    height: String(totalHeight) + "px",
  };

  const recoveredHeight = (props.data[2] / props.data[1]) * 100;
  const recoveredStyle = {
    height: `calc(${recoveredHeight}%)`,
  };
  const deathStyle = {
    bottom: `calc(${recoveredHeight}%)`,
  };

  return (
    <>
      <div
        className="Bar"
        ref={barRef}
        style={heightStyle}
        onMouseEnter={(e) => setHoveredFlag(e, true)}
        onMouseLeave={(e) => setHoveredFlag(e, false)}
        onMouseMove={(e) => setHoveredPosition(e)}
      >
        <div className={["BarTotal", props.class_index].join(" ")}>
          {props.data[1]}
        </div>
        <div
          className={["BarRecovered", props.class_index].join(" ")}
          style={recoveredStyle}
        >
          {props.data[2]}
        </div>
        <div
          className={["BarDeath", props.class_index].join(" ")}
          style={deathStyle}
        >
          {props.data[3]}
        </div>
      </div>
      <div
        ref={flashRef}
        className={[
          "BarFlash",
          hovered
            ? " d-flex justify-content-center align-items-center parent-hovered"
            : " d-none",
        ].join("")}
        style={{ bottom: `${bottom}px` }}
      >
        <div className="bar-flash-content d-flex w-100 h-100 align-items-center flex-column justify-content-center">
          <span className="d-block w-100 text-weight-bolder">{`${hoveredOn} Cases`}</span>
          {hoveredOn === "Total" && (
            <span className="d-block text-weight-bolder">{props.data[1]}</span>
          )}
          {hoveredOn === "Death" && (
            <span className="d-block text-weight-bolder">{props.data[3]}</span>
          )}
          {hoveredOn === "Recovered" && (
            <span className="d-block text-weight-bolder">{props.data[2]}</span>
          )}
        </div>
      </div>
    </>
  );
};

export default React.memo(Bar);
