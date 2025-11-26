# Thingworx Entity Exporter

<div align="left">
  <img src="https://img.shields.io/badge/Frontend-React-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Backend-Flask-000000?logo=flask&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/Language-TypeScript%20%2F%20Python-blue" />
  <img src="https://img.shields.io/badge/ThingWorx-Integration-0D83B0" />
</div>

A lightweight tool for exporting entities from **PTC ThingWorx** into a structured, source-control–friendly format.
Built with a **React** frontend for configuration and previewing changes, backed by a **Flask** API for secure server communication and export processing.

## ⚠️ Disclaimer

This project is currently a **work in progress** and is being developed primarily as a **learning exercise.**<br>
Not all features may be fully implemented, stable, or functioning as intended.

## 🚀 Features

* **Manage multiple ThingWorx servers** <br>
Add and configure multiple ThingWorx server instances.

* **Secure AppKey storage** <br>
App Keys are encrypted and saved locally in a `ServerConfig.json` file.

* **Change tracking by date** <br>
Provide a cutoff date to view recently edited entities.

* **Source control export** <br>
Export entities into a local file repository.

* **Individual exports** <br>
Directly download individual entities locally.

* **Automatic file organization** <br>
Exported entity files are:
  * Cleanly renamed
  * Sorted by ThingWorx object type <br>
*(Things, DataShapes, Mashups, ThingTemplates, etc..)*


## 🧰 Getting Started

### Prerequisites

* Docker & Docker Compose installed
* A ThingWorx AppKey with appropriate permissions <br>
  *(Entity Services + Read/Export access)*



## 🛠 Installation

Clone or download the repository, then build the Docker image using the included `Dockerfile`:

```
docker build -t tw-exporter .
```



## ▶️ Running the Application

1. Open the included `docker-compose.yml` file.

2. Map the **/app/data** directory in the container to the desired local repo path. <br>
   Each configured server will automatically create:

   * A subfolder under the mapped directory
   * A `ServerConfig.json` file
   * A `SourceControl/` folder containing the exported entities

3. Start the stack:

```
docker-compose up -d
```

Once running, open localhost:5000 in your browser to configure servers, preview changes, and export entities.



## 👥 Authors

**Wyatt Bloom** 
<br>
✉️ [Email](mailto:wyattbloom.wb@gmail.com)
<br>
🔗 [Linkden](https://www.linkedin.com/in/wyatt-bloom-a08243246/)
<br>
📦 [Github](https://github.com/WyattBloom1)