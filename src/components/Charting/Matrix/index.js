import React, { Fragment, useState, useEffect, useRef } from "react";
import "./index.css";
import Bar from "../Bar";

const Matrix = ({ cols, rows, col_labels, row_labels, data }) => {
  const matrixRef = useRef(null);
  const [cellWidth, setCellWidth] = useState(10);
  const [cellHeight, setCellHeight] = useState(10);

  // console.log(cols, rows, col_labels, row_labels);

  useEffect(() => {
    if (matrixRef.current) {
      setCellWidth(
        String(Math.floor(matrixRef.current.offsetWidth / cols)) + "px"
      );
      setCellHeight(
        String(Math.floor(matrixRef.current.offsetHeight / rows)) + "px"
      );
    }
  }, [matrixRef, cols, rows]);

  return (
    <div
      className="matrix w-100 h-100 d-flex flex-column justify-content-center align-items-center"
      ref={matrixRef}
    >
      {row_labels.map((row, row_index) => {
        return (
          <div
            key={String(row_index)}
            className="matrix-row d-flex flex-row justify-content-center py-0 w-75"
          >
            {col_labels.map((col, col_index) => {
              let class_names = "matrix-cell";
              class_names = class_names.concat(
                row_index === 0 ? " first-row" : " not-first-row"
              );
              class_names = class_names.concat(
                row_index === rows - 1 ? " last-row" : ""
              );
              class_names = class_names.concat(
                col_index === 0 ? " first-col" : " not-first-col"
              );
              class_names = class_names.concat(
                col_index === cols - 1 ? " last-col" : ""
              );
              class_names = class_names.concat(
                row_index === rows - 2 ? " second-last-row" : ""
              );

              const widthStyle = {
                width: cellWidth,
                height: cellHeight,
              };

              const span_class_name = class_names.includes(
                " last-row first-col"
              )
                ? "visibility-hidden"
                : class_names.includes(" last-row")
                ? "d-block label-span text-right"
                : class_names.includes(" first-col")
                ? "d-block label-span no-wrap"
                : "d-none";

              const isCol = class_names.includes(" first-col") ? true : false;
              const spanStyle = class_names.includes(" first-col")
                ? {
                    transform: `translate(-${Math.round(
                      String(row).length * 9.5 + 8
                    )}px, -12px)`,
                    width: `${String(row).length * 9.5 + 8}px`,
                  }
                : null;

              const showSpans =
                class_names.includes(" first-col") ||
                class_names.includes(" last-row");

              const placeBars =
                !class_names.includes(" first-col") &&
                class_names.includes(" second-last-row") &&
                col !== "";

              // console.log("placeBars", placeBars, col, typeof col);
              // console.log("col", col);

              return (
                <div
                  key={String(row_index) + String(col_index)}
                  className={class_names}
                  style={widthStyle}
                >
                  {placeBars && (
                    <Bar
                      data={data.filter((x) => x[0] === col)[0]}
                      max={row_labels[1]}
                      class_index={"rc" + String(row_index) + String(col_index)}
                    />
                  )}
                  {showSpans && (
                    <span className={span_class_name} style={spanStyle}>
                      {isCol ? row : col}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Matrix);
