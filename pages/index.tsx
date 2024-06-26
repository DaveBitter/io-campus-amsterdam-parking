// Libs
import React, { Fragment, useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";

// Utils

// Resources
import CopyIcon from "../src/static/img/icons/copy.svg";
import EmailIcon from "../src/static/img/icons/email.svg";

// Components

// Interface

// Component
const getEndOfNextWeek = (date: Date) => {
  const lastday = date.getDate() - (date.getDay() - 1) + 13;
  return new Date(date.setDate(lastday));
};

const getFormattedSelectedPartsOfDayString = (
  key: string,
  selectedPartsOfDay: any
) => {
  const list = [];

  !selectedPartsOfDay[key]?.day && list.push("day");
  selectedPartsOfDay[key]?.day && list.push("day");
  selectedPartsOfDay[key]?.evening && list.push("evening");

  // @ts-ignore
  return new Intl.ListFormat("en", {
    style: "long",
    type: "conjunction",
  }).format(list);
};

function copyToClip(str: string) {
  function listener(e: any) {
    e.clipboardData.setData("text/html", str);
    e.clipboardData.setData("text/plain", str);
    e.preventDefault();
  }
  document.addEventListener("copy", listener);
  document.execCommand("copy");
  document.removeEventListener("copy", listener);
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function replaceAll(str: string, find: string, replace: string) {
  return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
}

const Home = () => {
  const [disabledDays, setDisabledDays] = useState<
    [{ before: Date }, { after: Date }] | null
  >(null);

  useEffect(() => {
    const today = new Date();
    setDisabledDays([
      { before: new Date() },
      { after: getEndOfNextWeek(today) },
    ]);
  }, []);

  const [name, setName] = useState<string | null>(null);
  const [licensePlate, setLicensePlate] = useState<string | null>(null);
  const [campus, setCampus] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = React.useState<Date[]>();
  const [selectedPartsOfDay, setSelectedPartsOfDay] = useState({});
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  useEffect(() => {
    name && window.localStorage.setItem("name", name);
    licensePlate && window.localStorage.setItem("licensePlate", licensePlate);
    campus && window.localStorage.setItem("campus", campus);
  }, [name, licensePlate, campus]);

  useEffect(() => {
    setName(window.localStorage.getItem("name") || null);
    setLicensePlate(window.localStorage.getItem("licensePlate") || null);
    setCampus(window.localStorage.getItem("campus") || "Amsterdam");
  }, []);

  const outputRef = useRef<HTMLHtmlElement>(null);
  const copiedFeedbackRef = useRef<HTMLHtmlElement>(null);
  const triggerCopyToClipboard = () => {
    copyToClip(outputRef.current?.innerText || "");

    if (copiedFeedbackRef.current) {
      setShowCopiedFeedback(true);

      setTimeout(() => setShowCopiedFeedback(false), 2000);
    }
  };

  const [mailtoBody, setMailtoBody] = useState<string | null>(null);
  useEffect(() => {
    // setTimeout is needed to wait for the DOM to update
    setTimeout(() => {
      outputRef?.current?.innerHTML &&
        setMailtoBody(
          replaceAll(
            replaceAll(outputRef.current?.innerHTML, "<br>", "%0D%0A"),
            "<!-- -->",
            ""
          )
        );
    }, 0);
  }, [name, licensePlate, campus, selectedDays]);

  return (
    <>
      <main>
        <h1 className="text-colored">iO {campus} Campus Parking</h1>
        <p className="copy--large">
          Easily create an email template to let{" "}
          <a
            href={`mailto:office.${campus
              ?.toLowerCase()
              .split(" ")
              .join("")}@iodigital.com`}
          >
            office.
            {campus
              ?.toLowerCase()
              .split(" ")
              .join("")}
            @iodigital.com
          </a>{" "}
          know that you want to reserve a parking spot.
        </p>

        <form className="form" onSubmit={(e) => e.preventDefault()}>
          <fieldset className="form__fieldset">
            <div className="form__item">
              <label className="form__label" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                className="form__input"
                type="text"
                name="name"
                value={name || ""}
                onChange={({ target }) => setName(target.value)}
                required
              />
            </div>
            <div className="form__item">
              <label className="form__label" htmlFor="license-plate">
                License plate
              </label>
              <input
                id="license-plate"
                className="form__input"
                type="text"
                name="license-plate"
                value={licensePlate || ""}
                onChange={({ target }) => setLicensePlate(target.value)}
                required
              />
            </div>
            <div className="form__item">
              <div className="form__radio-container">
                <label className="form__label" htmlFor="campus-amsterdam">
                  Campus Amsterdam
                </label>
                <input
                  id="campus-amsterdam"
                  className="form__input"
                  type="radio"
                  name="campus"
                  checked={campus === "Amsterdam"}
                  onChange={() => setCampus("Amsterdam")}
                  required
                />
              </div>
              <div className="form__radio-container">
                <label className="form__label" htmlFor="campus-den-bosch">
                  Campus Den Bosch
                </label>
                <input
                  id="campus-den-bosch"
                  className="form__input"
                  type="radio"
                  name="campus"
                  checked={campus === "Den Bosch"}
                  onChange={() => setCampus("Den Bosch")}
                  required
                />
              </div>
              <div className="form__radio-container">
                <label className="form__label" htmlFor="campus-rotterdam">
                  Campus Rotterdam
                </label>
                <input
                  id="campus-rotterdam"
                  className="form__input"
                  type="radio"
                  name="campus"
                  checked={campus === "Rotterdam"}
                  onChange={() => setCampus("Rotterdam")}
                  required
                />
              </div>
              <div className="form__radio-container">
                <label className="form__label" htmlFor="campus-utrecht">
                  Campus Utrecht
                </label>
                <input
                  id="campus-utrecht"
                  className="form__input"
                  type="radio"
                  name="campus"
                  checked={campus === "Utrecht"}
                  onChange={() => setCampus("Utrecht")}
                  required
                />
              </div>
            </div>
            <div className="form__item">
              {disabledDays && (
                <DayPicker
                  mode="multiple"
                  weekStartsOn={1}
                  selected={selectedDays}
                  onSelect={(date) => setSelectedDays(date)}
                  disabled={disabledDays}
                />
              )}
            </div>

            <ol className="list-desk list-unstyled">
              {selectedDays?.map((selectedDay: Date, index) => (
                <li key={selectedDay.toString()}>
                  {new Intl.DateTimeFormat("en", {
                    weekday: "long",
                  }).format(selectedDay)}{" "}
                  {new Intl.DateTimeFormat("nl", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  }).format(selectedDay)}{" "}
                  <div className="form__radio-group">
                    <div className="form__radio-item">
                      <input
                        id={`day-${index}`}
                        className="form__radio-input"
                        type="checkbox"
                        onChange={({ target }) =>
                          setSelectedPartsOfDay({
                            ...selectedPartsOfDay,
                            [selectedDay.toString()]: {
                              day: target.checked,
                              evening:
                                selectedPartsOfDay[selectedDay.toString()]
                                  ?.evening || false,
                            },
                          })
                        }
                        name={`part-of-day-${index}`}
                        defaultChecked
                      />
                      <label
                        htmlFor={`day-${index}`}
                        className="form__radio-labe"
                      >
                        day
                      </label>
                    </div>
                    <div className="form__radio-item">
                      <input
                        id={`evening-${index}`}
                        className="form__radio-input"
                        type="checkbox"
                        onChange={({ target }) =>
                          setSelectedPartsOfDay({
                            ...selectedPartsOfDay,
                            [selectedDay.toString()]: {
                              day:
                                selectedPartsOfDay[selectedDay.toString()]
                                  ?.day || false,
                              evening: target.checked,
                            },
                          })
                        }
                        name={`part-of-day-${index}`}
                      />
                      <label
                        htmlFor={`evening-${index}`}
                        className="form__radio-labe"
                      >
                        evening
                      </label>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </fieldset>
          <output className="form__output copy--large" ref={outputRef}>
            Hi Office,
            <br />
            <br />I would love to reserve a parking spot for the following days
            at the iO Campus {campus}:
            <br />
            <br />
            {selectedDays ? (
              selectedDays.map((selectedDay: Date) => (
                <Fragment key={selectedDay.toString()}>
                  -{" "}
                  {new Intl.DateTimeFormat("en", {
                    weekday: "long",
                  }).format(selectedDay)}{" "}
                  {new Intl.DateTimeFormat("nl", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  }).format(selectedDay)}{" "}
                  for the{" "}
                  {getFormattedSelectedPartsOfDayString(
                    selectedDay.toString(),
                    selectedPartsOfDay
                  )}
                  <br />
                </Fragment>
              ))
            ) : (
              <>
                <pre>No days selected</pre>
              </>
            )}
            <br />
            My license plate is: {licensePlate}
            <br />
            <br />
            Kind regards,
            <br />
            <br />
            {name}
          </output>
        </form>

        <div className="actions">
          <a
            className="mailto-link"
            href={`mailto:office.${campus
              ?.toLowerCase()
              .split(" ")
              .join(
                ""
              )}@iodigital.com?subject=Parking spot reservation request ${name} (${licensePlate})&body=${mailtoBody}`}
          >
            email
            <EmailIcon />
          </a>
          <div className="clipboard">
            <button
              className="clipboard__trigger"
              onClick={() => triggerCopyToClipboard()}
            >
              copy
              <CopyIcon />
            </button>
            <span
              className="clipboard__feedback"
              data-active={showCopiedFeedback}
              ref={copiedFeedbackRef}
            >
              copied to clipboard!
            </span>
          </div>
        </div>
      </main>
      {campus === "Amsterdam" && (
        <footer>
          <h2 className="text-colored">How does it work?</h2>
          <ol>
            <li>
              Reserve a parking spot by sending an email to{" "}
              <a
                href={`mailto:office.${campus
                  ?.toLowerCase()
                  .split(" ")
                  .join("")}@iodigital.com`}
              >
                office.
                {campus
                  ?.toLowerCase()
                  .split(" ")
                  .join("")}
                @iodigital.com
              </a>
            </li>
            <li>
              If the barrier does not open upon your arrival, obtain a ticket
              and confirm with the Office that you have been added. If you have
              been added, press the information button when exiting and request
              that the barrier be opened for you.
            </li>
          </ol>
        </footer>
      )}
    </>
  );
};

// Props
Home.defaultProps = {};

export default Home;
