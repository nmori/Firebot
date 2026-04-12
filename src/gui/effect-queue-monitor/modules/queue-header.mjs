const queueHeader = {
    props: ["queue"],
    computed: {
        modeLabel() {
            if (this.queue.mode === "interval") {
                return "間隔実行";
            }
            if (this.queue.mode === "custom") {
                return "カスタム";
            }
            if (this.queue.mode === "auto") {
                return "順次実行";
            }
            if (this.queue.mode === "manual") {
                return "手動";
            }
            return "不明";
        },
        shouldShowInterval() {
            return ["interval", "auto"].includes(this.queue.mode);
        },
        intervalName() {
            if (this.queue.mode === "interval") {
                return "間隔:";
            }
            if (this.queue.mode === "auto") {
                return "遅延:";
            }
            return "";
        },
        intervalValue() {
            return `${this.queue.interval || "0"}秒`;
        }
    },
    template: `
        <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center;">
                <h2 style="margin: 0; margin-right: 15px">{{ queue.name }}</h2>
            </div>
            <div style="display: flex; gap: 5px;">
                <chip
                    label="モード:"
                    :value="modeLabel"
                />
                <chip
                    v-if="shouldShowInterval"
                    :label="intervalName"
                    :value="intervalValue"
                />
            </div>
        </div>
    `
};

export { queueHeader };