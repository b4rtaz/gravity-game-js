import { Client } from "./client/client";
import { Gui } from "./client/gui/gui";

window.addEventListener('load', () => {
  const client = new Client();
  const gui = new Gui(client);
  client.clientReady.on(() => gui.start());
  client.start();
});
