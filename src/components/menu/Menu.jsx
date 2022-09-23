import "./menu.scss";
import {
  MailOutline,
  Instagram,
  WorkOutline,
  LinkedIn,
  GitHub,
} from "@material-ui/icons";

export default function Menu({ menuOpen, setMenuOpen }) {
  return (
    <div className={"menu " + (menuOpen && "active")}>
      <ul>
        <li
          className="hover-underline-animation"
          onClick={() => setMenuOpen(false)}
        >
          <a href="#intro">Home</a>
        </li>
        <li
          className="hover-underline-animation"
          onClick={() => setMenuOpen(false)}
        >
          <a href="#portfolio">Projects</a>
        </li>
        <li
          className="hover-underline-animation"
          onClick={() => setMenuOpen(false)}
        >
          <a href="#Skills">Skills</a>
        </li>
        <li
          className="hover-underline-animation"
          onClick={() => setMenuOpen(false)}
        >
          <a href="#contact">Contact</a>
        </li>
        <li onClick={() => setMenuOpen(false)}>
          <a
            className="itemContainer"
            href="https://github.com/aymksen"
            target="_blank"
            rel="noreferrer"
          >
            <GitHub className="icon" />
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
          <a className="itemContainer" href="mailto:aymksen@gmail.com">
            <MailOutline className="icon" />
            <span></span>
          </a>

          <a href="#contact" className="itemContainer">
            <WorkOutline className="icon" />
            <span></span>
          </a>
        </li>
      </ul>
    </div>
  );
}
