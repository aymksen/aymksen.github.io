import "./topbar.scss";
import {
  MailOutline,
  Instagram,
  WorkOutline,
  LinkedIn,
  GitHub,
} from "@material-ui/icons";

export default function Topbar({ menuOpen, setMenuOpen }) {
  return (
    <div className={"topbar " + (menuOpen && "active")}>
      <div className="wrapper ">
        <div className="left">
          <a href="#intro" className="logo" onClick={() => setMenuOpen(false)}>
            AM.
          </a>
          <a
            className="itemContainer"
            href="https://github.com/aymks"
            target="_blank"
            rel="noreferrer"
          >
            <GitHub className="icon g" />
          </a>
          <a
            className="itemContainer"
            href="https://www.linkedin.com/in/aymksen/"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedIn className="icon" />
          </a>
          <a
            className="itemContainer"
            href="https://www.instagram.com/aymksen/"
            target="_blank"
            rel="noreferrer"
          >
            <Instagram className="icon" />
            <span></span>
          </a>

          <a className="itemContainer" href="mailto:aymenmks99@gmail.com">
            <MailOutline className="icon" />
            <span></span>
          </a>

          <a href="#contact" className="itemContainer">
            <WorkOutline className="icon" />
            <span></span>
          </a>
        </div>
        <div className="right">
          <div className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="line1"></span>
            <span className="line2"></span>
            <span className="line3"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
