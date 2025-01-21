class BlueprintError extends Error {
  constructor(message, line = null, column = null) {
    super(message);
    this.name = "BlueprintError";
    this.line = line;
    this.column = column;
  }
}

module.exports = BlueprintError;
