const { gitContext } = require("../execution-context/git");

const context = {};

gitContext(context).then(() => {
    console.log(context);
});