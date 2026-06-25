class ErrorHandler extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode; 
  }
}

export const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 500;

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    const message = `Duplicate ${Object.keys(err.keyValue)} entered`;
    err = new ErrorHandler(message, 400);
  }

//JsonWebTokenError
if (err.name === "JsonWebTokenError") {
    const message = "JSON web Token is invalid,try again";
    err = new ErrorHandler(message, 400);
}

//TokenExpiredError
if (err.name === "TokenExpiredError") {
    const message = "JSON web Token is invalid,try again";
    err = new ErrorHandler(message, 400);
}


// Cast Error (Invalid MongoDB ID)
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }
   
const errorMessage=err.errors
 ?Object.values(err.errors).map((value)=>value.message)
 .join(",")
  :err.message;


  
 return res.status(err.statusCode).json({
    success: false,
    message: errorMessage,
  });
};

export default ErrorHandler;
