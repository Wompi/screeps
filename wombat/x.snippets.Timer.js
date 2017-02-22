let timer = 0;
module.exports.setup = function setup() {
    Object.assign(Game, {
            /**
             * Start timer
             * @param {boolean} inCPU
             */
            startTimer(inCPU = true) {
                if (inCPU) {
                    timer = this.cpu.getUsed()
                } else {
                    timer = Date.now()
                }

            },
            /**
             * End timer and return the used cpu
             * @param {boolean} inCPU
             * @returns {number}
             */
            endTimer(inCPU = true) {
                if (inCPU) {
                    return this.cpu.getUsed() - timer;
                } else {
                    return Date.now() - timer;
                }
            }
		}
	);
};
