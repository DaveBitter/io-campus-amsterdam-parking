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

const today = new Date();
const disabledDays = [
  { before: new Date() },
  { after: getEndOfNextWeek(today) },
];

const getFormattedSelectedPartsOfDayString = (
  key: string,
  selectedPartsOfDay: any
) => {
  const list = [];

  !selectedPartsOfDay[key]?.day && list.push("day");
  selectedPartsOfDay[key]?.day && list.push("day");
  selectedPartsOfDay[key]?.evening && list.push("evening");

  // @ts-ignore
  return new Intl.ListFormat("nl", {
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
  const [name, setName] = useState<string | null>(null);
  const [licensePlate, setLicensePlate] = useState<string | null>(null);
  const [selectedDays, setSelectedDays] = React.useState<Date[]>();
  const [selectedPartsOfDay, setSelectedPartsOfDay] = useState({});
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);

  useEffect(() => {
    name
      ? window.localStorage.setItem("name", name)
      : setName(window.localStorage.getItem("name") || null);
    licensePlate
      ? window.localStorage.setItem("licensePlate", licensePlate)
      : setLicensePlate(window.localStorage.getItem("licensePlate") || null);
  }, [name, licensePlate]);

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
    outputRef?.current?.innerHTML &&
      setMailtoBody(replaceAll(outputRef.current?.innerHTML, "<br>", "%0D%0A"));
  }, [name, licensePlate, selectedDays]);

  return (
    <main>
      <h1 className="text-colored">iO Amsterdam Campus Parking</h1>
      <p className="copy--large">
        Easily create an email template to let{" "}
        <a href="mailto:office.amsterdam@iodigital.com">
          office.amsterdam@iodigital.com
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
            <DayPicker
              mode="multiple"
              weekStartsOn={1}
              defaultMonth={today}
              selected={selectedDays}
              onSelect={(date) => setSelectedDays(date)}
              disabled={disabledDays}
            />
          </div>

          <ol className="list-unstyled">
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
                              selectedPartsOfDay[selectedDay.toString()]?.day ||
                              false,
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
          <br />I would love to reserve a parking spot for the following days at
          the iO Campus Amsterdam:
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
          href={`mailto:office.amsterdam@iodigital.com?subject=Parking spot reservation request ${name} (${licensePlate})&body=${mailtoBody}`}
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
  );
};

// Props
Home.defaultProps = {};

export default Home;
