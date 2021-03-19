import React, { Fragment, useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "./index.css";
import loader from "./../../assets/images/loader.gif";
import Matrix from "./../Charting/Matrix";

import CovidData from "../../resources/covid_19_data.js";

const CovidCharting = () => {
  const [data, setData] = useState("");
  const [headers, setHeaders] = useState();
  const [dataInit, setDataInit] = useState(false);
  const [dataInitCompleted, setDataInitCompleted] = useState(false);

  //   # 0 : Total, Active, Death & Recovered Cases and Quaterly wise
  //   # 1 : Total, Active, Death & Recovered Cases and Monthly wise
  // const [viewType, setViewType] = useState(0);

  const [quaterly, setQuaterly] = useState("");

  const getFiveSeparators = (min_max) => {
    let list = [];
    const maxQuaterDiff = Math.round(min_max[1] / 4);

    list.push(min_max[1] + maxQuaterDiff);
    list.push(list[list.length - 1] - maxQuaterDiff);
    list.push(list[list.length - 1] - maxQuaterDiff);
    list.push(list[list.length - 1] - maxQuaterDiff);
    list.push(list[list.length - 1] - maxQuaterDiff);
    // if (list[list.length - 1] - maxQuaterDiff > min_max[0] * 2) {
    //   list.push(list[list.length - 1] - maxQuaterDiff);
    // }
    list.push(min_max[0]);
    list.push(Math.round(min_max[0] / 2));
    list.push(0);

    return list;
  };

  const crossDataGroupByKey = (Key, Data) => {
    let lastKey = "";
    let confirmedTotal = 0;
    let recoveredTotal = 0;
    let deathTotal = 0;
    return Data.map((p, index, arr) => {
      if (lastKey !== p[Key]) {
        if (index > 0) {
          const result = [];
          const separator = [];
          separator.push(lastKey);
          separator.push(confirmedTotal);
          separator.push(recoveredTotal);
          separator.push(deathTotal);
          result.push(separator);
          result.push(p);
          lastKey = p[Key];
          confirmedTotal = p.Confirmed;
          recoveredTotal = p.Recovered;
          deathTotal = p.Deaths;
          return result;
        } else {
          lastKey = p[Key];
          confirmedTotal = p.Confirmed;
          recoveredTotal = p.Recovered;
          deathTotal = p.Deaths;
          return p;
        }
      } else {
        confirmedTotal += p.Confirmed;
        recoveredTotal += p.Recovered;
        deathTotal += p.Deaths;
        if (index === arr.length - 1) {
          const result = [];
          const separator = [];
          separator.push(lastKey);
          separator.push(confirmedTotal);
          separator.push(recoveredTotal);
          separator.push(deathTotal);
          result.push(p);
          result.push(separator);
          return result;
        } else {
          return p;
        }
      }
    })
      .flat()
      .filter((x) => Array.isArray(x));
  };

  // load chunk data using Promise
  useEffect(() => {
    // # chaining Promise here
    new Promise((resolve, reject) => {
      setTimeout(() => {
        // # explicitly wait 2s for chunk assured loading
        const all_lines = CovidData().toString().split("\n");
        resolve(all_lines);
      }, 2000);
    }).then((lines) => {
      // # shifting first array item inside headers
      setHeaders(lines.shift().split(","));
      setData(lines);
    });
  }, []);

  // # creating list of objects and inserting back to data hook object
  useEffect(() => {
    if (headers && data.length > 0 && !dataInit) {
      setDataInit(true);

      const objectList = data.map((item) => {
        const obj = {};
        const cols = item.split(",");
        headers.forEach((header, index) => {
          obj[header] = cols[index];
        });
        return obj;
      });
      setData(objectList);
      setDataInitCompleted(true);
    }
  }, [headers, data, dataInit, dataInitCompleted]);

  // # append the sorted Observation Date and Grouped By
  useEffect(() => {
    if (dataInitCompleted) {
      const sortedData = data
        .sort(
          (a, b) =>
            new Date(a["Observation-Date"]) > new Date(b["Observation-Date"])
        )
        .map((x) => {
          let observed = new Date(x["Observation-Date"]);
          let quater = observed.getMonth();
          quater =
            quater >= 9 ? "Q4" : quater >= 6 ? "Q3" : quater >= 3 ? "Q2" : "Q1";
          quater = quater + "/" + String(observed.getFullYear()).substr(2);
          x["Observation-Date"] = quater;
          x["SNo"] = parseInt(x["SNo"]);
          x["Confirmed"] = parseInt(x["Confirmed"]);
          x["Deaths"] = parseInt(x["Deaths"]);
          x["Recovered"] = parseInt(x["Recovered"]);
          return x;
        });
      setQuaterly(crossDataGroupByKey("Observation-Date", sortedData));
    }
  }, [dataInitCompleted, data]);

  return (
    <Fragment>
      <Helmet>
        <title>Covid-19 Country wise Query Reporting</title>
        <meta name="description" content="Covid-19 Country wise reporting" />
      </Helmet>
      <div className="CovidDataQuery col-12 pt-4 pb-5 position-relative h-100">
        {/* # if data is getting imported */}
        {!dataInitCompleted && (
          <section className="loader position-absolute">
            <img
              src={loader}
              alt=""
              width="48"
              height="48"
              className="align-self-center"
            />
          </section>
        )}
        {/* {console.log("quaterly", quaterly)} */}
        {/* {quaterly !== "" && (
          <span>
            Covid-19 [Confirmed, Recovered, Deaths] -
            {JSON.stringify(quaterly).substr(0, 500)}
          </span>
        )} */}
        {/* # covid-19 data is loaded */}
        {dataInitCompleted && quaterly !== "" && (
          <section className="chart-section position-absolute pt-5">
            <div className="chart-container">
              <div className="matrix-layer mx-5 px-3 py-5 d-flex align-items-center justify-content-start">
                <Matrix
                  cols={quaterly.length + 2}
                  rows={8}
                  col_labels={[0, ...quaterly.map((x) => x[0]), ""]}
                  row_labels={getFiveSeparators(
                    quaterly.reduce((x, y) => {
                      if (x.length <= 1) {
                        x.push(y[1]);
                      } else {
                        let [min, max] = x;
                        if (min > y[1]) {
                          min = y[1];
                        } else if (max < y[1]) {
                          max = y[1];
                        }
                        x = [min, max];
                      }
                      return x;
                    }, [])
                  )}
                  data={quaterly}
                />
              </div>
            </div>
          </section>
        )}
      </div>
    </Fragment>
  );
};

export default React.memo(CovidCharting);
