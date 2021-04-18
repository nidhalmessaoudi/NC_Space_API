export default server => {
    process.on("unhandledRejection", err => {

        console.log(err.name, err.message);
        console.log("UNHANDLED REJECTION! Server shutting down...");
        server.close(() => {
            process.exit(1);
        });

    });
} 