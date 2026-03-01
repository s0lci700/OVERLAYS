/**
 * Control panel bootstrap: load global styles and mount the root Svelte app.
 */
import { mount } from "svelte";
import "./app.css";
import App from "./App.svelte";

mount(App, { target: document.getElementById("app") });
