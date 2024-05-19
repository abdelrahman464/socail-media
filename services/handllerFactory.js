const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");

exports.updateOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!document) {
      return next(new ApiError(`Document not found`, 404));
    }
    res.status(200).json({ document });
  });

exports.createOne = (Model) =>
  asyncHandler(async (req, res) => {
    const document = await Model.create(req.body);
    res.status(201).json({ document });
  });


  exports.getOne = (Model, populationOt) =>
    asyncHandler(async (req, res, next) => {
      const { id } = req.params;
  
      // 1 - Build query
      let query = Model.findById(id);
  
      // Handle population based on whether it's an array or a single option
      if (populationOt) {
        if (Array.isArray(populationOt)) {
          // If populationOt is an array, populate each specified path
          populationOt.forEach(popOption => {
            query = query.populate(popOption);
          });
        } else {
          // Single populate object or string
          query = query.populate(populationOt);
        }
      }
  
      // 2 - Execute query
      const document = await query;
  
      if (!document) {
        return next(new ApiError(`Document not found`, 404));
      }
  
      res.status(200).json({ success: true, document });
    });

// eslint-disable-next-line default-param-last
exports.getALl = (Model, modelName = "", populationOt) =>
  asyncHandler(async (req, res) => {
    let filter = {};
    if (req.filterObj) {
      filter = req.filterObj;
    }
    let query = Model.find(filter);

    // Check if population options are provided and handle accordingly
    if (populationOt) {
      if (Array.isArray(populationOt)) {
        // If it's an array, populate each one
        populationOt.forEach((popOption) => {
          query = query.populate(popOption);
        });
      } else {
        // Single populate object or string
        query = query.populate(populationOt);
      }
    }
    const documentsCounts = await Model.countDocuments();
    const apiFeatures = new ApiFeatures(query, req.query)
      .paginate(documentsCounts)
      .filter()
      .search(modelName)
      .limitFields()
      .sort();

    const { mongooseeQuery, paginationResult } = apiFeatures;
    const documents = await mongooseeQuery;

    res
      .status(200)
      .json({ results: documents.length, paginationResult, data: documents });
  });
exports.deleteOne = (Model) =>
  asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    const document = await Model.findByIdAndDelete(id);
    if (!document) {
      return next(new ApiError(`Document not found`, 404));
    }
    res.status(204).send();
  });
