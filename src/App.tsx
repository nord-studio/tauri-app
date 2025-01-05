import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { check } from "@tauri-apps/plugin-updater";
import { ask, message } from "@tauri-apps/plugin-dialog";
import { app } from "@tauri-apps/api";
import "./App.css";

function App() {
	const [greetMsg, setGreetMsg] = useState("");
	const [name, setName] = useState("");
	const [loading, setLoading] = useState(false);
	const [version, setVersion] = useState("");

	async function greet() {
		// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
		setGreetMsg(await invoke("greet", { name }));
	}

	async function getVersion() {
		setVersion(await app.getVersion());
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
				await app;
			}
		}

		setLoading(false);
	}

	useEffect(() => {
		getVersion();
	}, []);

	return (
		<main className="container">
			<h1>Updater Example</h1>
			<p>Running: {version}</p>

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
