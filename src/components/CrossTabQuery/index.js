import React, { Fragment, useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import ProductsData from "./../../resources/products";
import "./index.css";
import DeleteOutlinedIcon from "@material-ui/icons/DeleteOutlined";
import UndoOutlinedIcon from "@material-ui/icons/UndoOutlined";

const Headers = [
  "Id",
  "City",
  "Category",
  "Brand",
  "Name",
  "Type",
  "Size",
  "Price",
  "Stock",
];
const ViewLimits = [10, 15, 25, 50, 75, 100, 250];

const CrossTabHeaders = ["City", "Category", "Brand", "Name", "Type", "Size"];

const CrossTabQuery = () => {
  const [headers, setHeaders] = useState("");
  const [products, setProducts] = useState("");
  const [filter, setFilter] = useState("");
  const [viewLimits, setViewLimits] = useState(ViewLimits[4]);
  const [sortByHeaderKey, setSortByHeaderKey] = useState("Id");
  const [sortAscendingOrder, setSortAscendingOrder] = useState(true);
  const [removedProducts, setRemovedProducts] = useState([]);

  const [hoveredRow, setHoveredRow] = useState("");
  const [hoveredColumn, setHoveredColumn] = useState("");

  const crossProductGroupByKey = (Key, Products) => {
    if (CrossTabHeaders.includes(Key)) {
      let lastKey = "";
      let priceTotal = 0;
      let stockTotal = 0;
      // return Products.sort((a, b) => (a[Key] > b[Key] ? 1 : -1))
      return Products.map((p, index, arr) => {
        if (lastKey !== p[Key]) {
          if (index > 0) {
            const result = [];
            const separator = [];
            separator.push(lastKey);
            separator.push(priceTotal);
            separator.push(stockTotal);
            result.push(separator);
            result.push(p);
            lastKey = p[Key];
            priceTotal = p.Price;
            stockTotal = p.Stock;
            return result;
          } else {
            lastKey = p[Key];
            priceTotal = p.Price;
            stockTotal = p.Stock;
            return p;
          }
        } else {
          priceTotal += p.Price;
          stockTotal += p.Stock;
          if (index === arr.length - 1) {
            const result = [];
            const separator = [];
            separator.push(lastKey);
            separator.push(priceTotal);
            separator.push(stockTotal);
            result.push(p);
            result.push(separator);
            return result;
          } else {
            return p;
          }
        }
      }).flat();
    } else {
      return Products;
    }
  };

  useEffect(() => {
    const filteredProduct = ProductsData.map((p) =>
      removedProducts.includes(p.Id) ? null : p
    )
      .filter((p) => p !== null)
      .slice(0, viewLimits)
      .filter(
        (product) =>
          JSON.stringify(product).toLowerCase().indexOf(filter.toLowerCase()) >
          -1
      );
    let sortedOrderProduct = sortAscendingOrder
      ? filteredProduct.sort((a, b) =>
          a[sortByHeaderKey] > b[sortByHeaderKey] ? 1 : -1
        )
      : filteredProduct.sort((a, b) =>
          a[sortByHeaderKey] < b[sortByHeaderKey] ? 1 : -1
        );

    sortedOrderProduct = crossProductGroupByKey(
      sortByHeaderKey,
      sortedOrderProduct
    );

    setHeaders(Headers);
    setProducts(sortedOrderProduct);
  }, [
    viewLimits,
    filter,
    sortByHeaderKey,
    sortAscendingOrder,
    removedProducts,
  ]);

  const updateTrigerredFilter = (e) => {
    setFilter(String(e.target.value).trimStart());
  };

  const clearTrigerredFilter = (e) => {
    if (e.key === "Escape") {
      setFilter("");
    }
  };

  const selectViewLimits = (e) => {
    setViewLimits(e.target.value);
  };

  // set current active mouse hovering row
  const setHoveredDataRow = (Id) => {
    setHoveredRow(Id);
  };

  // set current active mouse hovering column
  const setHoveredDataColumn = (Key) => {
    setHoveredColumn(Key);
  };

  // set Object by sort by keyname
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const selectSortByHeaderKey = (e, Key) => {
    e.stopPropagation();
    if (sortByHeaderKey === Key) {
      setSortAscendingOrder(!sortAscendingOrder);
    }
    setSortByHeaderKey(Key);
  };

  // put thousand separator in amount
  const thousandSeparator = (val) => {
    const [main, prec] =
      String(val).indexOf(".") > -1 ? String(val).split(".") : [val, "00"];
    return [String(parseInt(main).toLocaleString()), prec.padEnd(2, "0")].join(
      "."
    );
  };

  // remove product id's from list of object
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const removeProduct = (e, Id) => {
    e.stopPropagation();
    const newRemovedList = [...removedProducts];
    newRemovedList.push(Id);
    // console.log(newRemovedList);
    setRemovedProducts(newRemovedList);
  };

  const undoRemovedProducts = (e, all = false) => {
    e.preventDefault();
    e.stopPropagation();
    if (all) {
      setRemovedProducts([]);
    } else {
      const newRemovedList = [...removedProducts];
      newRemovedList.pop();
      setRemovedProducts(newRemovedList);
    }
  };

  // get removed undo button
  const getItemUndoButton = () => {
    const bgColor =
      removedProducts.length > 0
        ? "bg-white pl-0 pr-3 pointer-cursor"
        : "cell-even not-allowed-cursor undo-disabled-width px-2";
    const style = ["undo-all pt-2 pb-2 text-right", bgColor].join(" ");
    return (
      <div className={style} onClick={(e) => undoRemovedProducts(e, true)}>
        {removedProducts.length}
        <div
          className="undo-pop d-flex align-items-center justify-content-center"
          onClick={(e) => undoRemovedProducts(e)}
        >
          <UndoOutlinedIcon
            style={{
              fontSize: "22px",
              color: "#fff",
            }}
          />
        </div>
      </div>
    );
  };

  // get filter search field
  const getProductFilterElement = () => {
    return (
      <div className="ml-auto search-field-container col-12 col-md-3 py-1 mr-3">
        <input
          className="w-100 px-2 py-1"
          type="search"
          onChange={(e) => updateTrigerredFilter(e)}
          onKeyDown={(e) => clearTrigerredFilter(e)}
          value={filter}
          placeholder="Product Filter..."
          maxLength="20"
        />
      </div>
    );
  };

  // get product views limiter
  const getProductViewLimiter = () => {
    return (
      <div className="view-limit-container pt-2 pb-1 mr-1">
        <select
          onChange={(e) => selectViewLimits(e)}
          className="w-75 px-2"
          defaultValue={viewLimits}
        >
          {ViewLimits.map((limits) => {
            return (
              <option value={limits} key={limits}>
                {limits}
              </option>
            );
          })}
        </select>
      </div>
    );
  };

  // getting headers
  const memoizedHeaders = useMemo(() => {
    return (
      <tr className="thead px-0">
        {headers.length > 0 &&
          headers.map((header) => {
            let textAlign = ["Id", "Price", "Stock"].includes(header)
              ? ["Price", "Stock"].includes(header)
                ? "text-right pr-3"
                : "text-center"
              : "text-center";
            textAlign = textAlign.concat(
              ["City", "Category", "Brand", "Name", "Type"].includes(header)
                ? " text-truncate"
                : "",
              sortByHeaderKey === header ? " sorted-cell" : ""
            );
            const style = [
              textAlign,
              "d-block pointer-cursor py-1 data-cell mb-1 position-relative",
            ].join(" ");
            return (
              <th
                scope="col"
                className="px-1 py-1"
                aria-describedby={header}
                key={header}
              >
                <label
                  aria-label={header}
                  className={style}
                  onClick={(e) => selectSortByHeaderKey(e, header)}
                >
                  {header !== "Id" ? header : "#"}
                </label>
              </th>
            );
          })}
      </tr>
    );
  }, [headers, sortByHeaderKey, selectSortByHeaderKey]);

  // getting data
  const memoizedProductsData = useMemo(() => {
    return (
      <tbody className="TabQueryBody">
        {products.length > 0 &&
          // after filtering objects, will map the object
          products.map((product, productIndex) => {
            // product is object
            if (Array.isArray(product)) {
              // product is an array
              return (
                <tr key={product[0]}>
                  <td colSpan="7" className="px-1 pt-0 pb-2">
                    <label className="d-block text-center grouped-by-cell text-white grouped-label">
                      {product[0]}
                    </label>
                  </td>
                  <td className="px-1 pt-0 pb-2">
                    <label className="d-block text-right pr-2 bg-dark text-white grouped-label">
                      {thousandSeparator(product[1])}
                    </label>
                  </td>
                  <td className="px-1 pt-0 pb-2">
                    <label className="d-block text-right pr-2 bg-dark text-white grouped-label">
                      {product[2]}
                    </label>
                  </td>
                </tr>
              );
            } else {
              const rowBG = hoveredRow === product.Id ? "hovered-row" : "";
              const headerRequired =
                productIndex >= 15 && productIndex % 15 === 0;
              const isNextRowHeader =
                productIndex + 1 >= 15 && (productIndex + 1) % 15 === 0;
              return [
                headerRequired && memoizedHeaders,
                <tr
                  className={["px-0", rowBG].join(" ")}
                  aria-describedby={product.name}
                  key={product.Id}
                  onMouseEnter={(e) => setHoveredDataRow(product.Id)}
                  onMouseLeave={(e) => setHoveredDataRow("")}
                >
                  {Object.keys(product).map((key) => {
                    let textAlign = ["Id", "Price", "Stock"].includes(key)
                      ? ["Price", "Stock"].includes(key)
                        ? "text-right pr-3"
                        : "text-center"
                      : "text-left pl-3";
                    textAlign = textAlign.concat(
                      ["City", "Category", "Brand", "Name", "Type"].includes(
                        key
                      )
                        ? " text-truncate"
                        : "",
                      key === "Id"
                        ? " position-relative overflow-hidden cell-id-label"
                        : ""
                    );
                    const cellBG =
                      hoveredRow === product.Id && hoveredColumn === key
                        ? "hovered-center-cell"
                        : hoveredRow === product.Id || hoveredColumn === key
                        ? "hovered-row-cell"
                        : product.Id % 2
                        ? "cell-odd"
                        : "cell-even";
                    const keepMarginBottom = isNextRowHeader ? "mb-0" : "mb-1";
                    const style = [
                      textAlign,
                      cellBG,
                      keepMarginBottom,
                      "d-block data-cell",
                    ].join(" ");

                    const value =
                      key === "Price"
                        ? thousandSeparator(product[key])
                        : product[key];

                    let hoveredIdSpan =
                      hoveredRow === product.Id &&
                      key === "Id" &&
                      hoveredColumn === key;
                    if (hoveredIdSpan) {
                      hoveredIdSpan = "hovered";
                    }

                    return [
                      <td
                        className="px-1 pt-0 pb-1"
                        aria-describedby={product[key]}
                        key={product[key]}
                        onMouseEnter={(e) => setHoveredDataColumn(key)}
                        onMouseLeave={(e) => setHoveredDataColumn("")}
                      >
                        <label className={style}>
                          {value}
                          {key === "Id" && (
                            <span
                              className={["id-span", hoveredIdSpan].join(" ")}
                              onClick={(e) => removeProduct(e, product[key])}
                            >
                              <DeleteOutlinedIcon
                                style={{
                                  fontSize: "22px",
                                  paddingBottom: "2px",
                                  color: "#fff",
                                }}
                              />
                            </span>
                          )}
                        </label>
                      </td>,
                    ];
                  })}
                </tr>,
              ];
            }
          })}
      </tbody>
    );
  }, [products, hoveredRow, hoveredColumn, memoizedHeaders, removeProduct]);

  // getting table footer
  const memoizedTabFooterData = useMemo(() => {
    const viewsLeft = viewLimits - ProductsData.length < 0;
    return (
      <tfoot className="TabQueryFooter">
        <tr>
          <td colSpan="9">
            {viewsLeft && (
              <label className="d-block ml-auto text-right text-danger pointer-cursor">
                <em>
                  <strong>
                    {String(Math.abs(viewLimits - ProductsData.length)) +
                      " rows more..."}
                  </strong>
                </em>
              </label>
            )}
          </td>
        </tr>
      </tfoot>
    );
  }, [viewLimits]);

  return (
    <Fragment>
      <Helmet>
        <title>Cross Tab Query Reporting</title>
        <meta name="description" content="Cross Tab Query Reporting" />
      </Helmet>
      <div className="CrossTabQuery col-12 pt-4 pb-5">
        <section className="d-flex flex-row justify-content-center mb-4">
          {getItemUndoButton()}
          {getProductFilterElement()}
          {getProductViewLimiter()}
        </section>
        <section>
          <table className="table table-borderless">
            {headers.length > 0 && (
              <thead className="TabQueryHeader">{memoizedHeaders}</thead>
            )}
            {products.length > 0 && memoizedProductsData}
            {memoizedTabFooterData}
          </table>
        </section>
      </div>
    </Fragment>
  );
};

export default React.memo(CrossTabQuery);
