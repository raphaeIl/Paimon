import fs from 'fs';

export default class Config {

    static instance = null;

    static getInstance() {
        return this.instance;
    }

    configPath = "./res/config.json"
    data = {}

    static async init() {
        if (this.instance == null)
            this.instance = new Config();

        await this.instance.readConfig().then((fileData) => {
            for (const key in fileData)
                this.instance.data[key] = fileData[key]
        })
    }

    async readConfig() {
        return new Promise((resolve, reject) => {
            fs.readFile(this.configPath, 'utf8', (err, data) => {
                if (err) {
                    reject(err);
                }
                try {
                  const fileData = JSON.parse(data);
                  resolve(fileData)
                } catch (e) {
                    reject(e);
                }
            });
        })
        .catch((err) => {
            console.error(err);
        });
    }

}