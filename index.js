const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// Créer un serveur
const app = express();
app.use(bodyParser.json());
//connection BDD
mongoose.connect("mongodb://localhost:27017/catalogue", {
  useNewUrlParser: true
});

//creation modeles Department, Category, Product
const Department = mongoose.model("Department", {
  title: { type: String, require: true, defaut: "" }
});
const Category = mongoose.model("Category", {
  title: { type: String, require: true, default: "" },
  description: { type: String, require: true, default: "" },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  } //(référence vers Department)
});
const Product = mongoose.model("Product", {
  title: { type: String, require: true, default: "" },
  description: { type: String, require: true, default: "" },
  price: { type: Number, require: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" } //(référence vers Category)
});

//route Department Create,Read, Update, Delete
//CREATE DEPARTMENT
app.post("/department/create", async (req, res) => {
  try {
    const newDepartment = new Department({
      title: req.body.title
    });
    await newDepartment.save();
    res.json({ message: "Created" });
  } catch (error) {
    return res.status(400).json({
      error: {
        message: "An error occured"
      }
    });
  }
});
//READ DEPARTMENT
app.get("/department", async (req, res) => {
  try {
    const departments = await Department.find();
    return res.json(departments);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// UPDATE DEPARTMENT
app.post("/department/update", async (req, res) => {
  try {
    const id = req.query.id; //sur postman mettre update/?id=....
    const department = await Department.findById(id);
    // Autre manière de trouver un document à partir d'un `id` :
    // const department = await Department.findById(req.body.id);
    if (department) {
      department.title = req.body.title;

      await department.save();
      res.json({ message: "Updated" });
    } else {
      res.status(404).json({ error: error.message });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
//DELETE DEPARTMENT
app.post("/department/delete", async (req, res) => {
  try {
    const id = req.query.id;
    const department = await Department.findById(id);
    // verif q objet a bien été trouvé
    //if (department !== null && department !== undefined && department !== 0&&department!=="")

    if (department) {
      await department.remove();
      res.json({ message: "Removed" });
    } else {
      res.status(404).json({ message: "Missing id" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//CRUD CATEGORY
//**CREATE CATEGORY**/
app.post("/category/create", async (req, res) => {
  console.log(req.body.title + req.body.description + req.body.department);
  try {
    const category = new Category({
      title: req.body.title,
      description: req.body.description,
      department: req.body.department
    });
    await category.save();
    res.json({ message: "Created" });
  } catch (error) {
    return res.status(400).json({
      message: error.message
    });
  }
});
//**READ CATEGORY */
app.get("/category", async (req, res) => {
  try {
    const category = await Category.find().populate("department");
    res.json(category);
  } catch (error) {
    return res.status(400).json({
      error: {
        message: "An error occured"
      }
    });
  }
});
//**UPDATE**/
app.post("/category/update", async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findById(id);
    // Autre manière de trouver un document à partir d'un `id` :
    // const student = await Student.findById(req.body.id);
    if (category) {
      category.title = req.body.title;
      category.description = req.body.description;
      category.department = req.body.department;
      await category.save();
      res.json({ message: "Updated" });
    } else {
      res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// **Delete**
app.post("/category/delete", async (req, res) => {
  try {
    const id = req.query.id;
    const category = await Category.findById(id);
    // Autre manière de trouver un document à partir d'un `id` :
    // const student = await Student.findById(req.body.id);
    if (category) {
      await category.remove();
      res.json({ message: "Removed" });
    } else {
      res.status(404).json({ message: "Missing id" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

//**PRODUCT**/
//**CREATE PRODUCT**/
app.post("/product/create", async (req, res) => {
  try {
    const product = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category
    });
    await product.save();
    res.json(product);
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
});

//**READ PRODUCT */
app.get("/product", async (req, res) => {
  try {
    let params = {};
    if (req.query.category) {
      params.category = req.query.category;
    }
    if (req.query.title) {
      params.title = req.query.title;
    }
    if (req.query.priceMin) {
      params.price = { $gte: req.query.priceMin };
    } else if (req.query.priceMax) {
      params.price = { $lte: req.query.priceMax };
    }
    if (req.query.sort === "price-asc") {
      search.sort({ price: 1 });
    }
    const product = await Product.find(params).populate("category"); //{ params.priceMin: { $gte: 100 } })
    // const fil = filter(req);
    // console.log(fil);
    // const lolo = await product.find(fil);

    return res.json(product);

    // else{
    //     const product = await Product.find().populate("Category");
    //     res.json(product);
    // }
  } catch (error) {
    return res.status(400).json({
      error: error.message
    });
  }
});
//**UPDATE PRODUCT**/
app.post("/product/update", async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);
    // Autre manière de trouver un document à partir d'un `id` :
    // const student = await Student.findById(req.body.id);
    if (product) {
      product.title = req.body.title;
      product.description = req.body.description;
      product.price = req.body.price;
      product.category = req.body.category;
      await product.save();
      res.json({ message: "Updated" });
    } else {
      res.status(400).json({ message: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// **Delete**
app.post("/product/delete", async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);
    // Autre manière de trouver un document à partir d'un `id` :
    // const student = await Student.findById(req.body.id);
    if (product) {
      await product.remove();
      res.json({ message: "Removed" });
    } else {
      res.status(404).json({ message: "Missing id" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Démarrer le serveur
app.listen(3000, () => {
  console.log("Server started");
});
