import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { ask, message } from "@tauri-apps/plugin-dialog";
import "./App.css";

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setGreetMsg(await invoke("greet", { name }));
	}

	async function checkForUpdates() {
		setLoading(true);
		const update = await check();

		if (update === null) {
			await message("You're on the latest version!", {
				title: "Up to date",
				kind: "info",
				okLabel: "OK",
			});
		} else if (update.available) {
			const yes = await ask(
				"An update is available. Do you want to install it?",
				{
					title: "Update Available",
					kind: "info",
					okLabel: "Update",
					cancelLabel: "Cancel",
				}
			);

			if (yes) {
				await update.downloadAndInstall();
				await invoke("graceful_restart");
			}
		}

		setLoading(false);
	}

	return (
		<main className="container">
			<h1>Updater Example</h1>

			<div className="row">
				<a href="https://vitejs.dev" target="_blank">
					<img
						src="/vite.svg"
						className="logo vite"
						alt="Vite logo"
					/>
				</a>
				<a href="https://tauri.app" target="_blank">
					<img
						src="/tauri.svg"
						className="logo tauri"
						alt="Tauri logo"
					/>
				</a>
				<a href="https://reactjs.org" target="_blank">
					<img
						src={reactLogo}
						className="logo react"
						alt="React logo"
					/>
				</a>
			</div>
			<p>Click on the Tauri, Vite, and React logos to learn more.</p>

			<div>
				<button onClick={checkForUpdates} id="update-button">
					{loading ? "Loading..." : "Check for updates"}
				</button>
			</div>

			<form
				className="row"
				onSubmit={(e) => {
					e.preventDefault();
					greet();
				}}
			>
				<input
					id="greet-input"
					onChange={(e) => setName(e.currentTarget.value)}
					placeholder="Enter a name..."
				/>
				<button type="submit">Greet</button>
			</form>
			<p>{greetMsg}</p>
		</main>
	);
}

export default App;
