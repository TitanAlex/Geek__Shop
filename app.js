const express = require('express')
const mysql = require('mysql');
const path = require('path')
const session = require('express-session');
// https://www.npmjs.com/package/bcrypt
const bcrypt = require("bcrypt");
const multer = require("multer");
const app = express()

// Путь к директории для загрузок
const upload = multer({ dest: "./public/img/" });

// Соединение с базой данных
const connection = mysql.createConnection({
  host: "127.0.0.1",
  database: "nature",
  user: "root",
  password: "55523891@%"
});

connection.connect(function (err) { if (err) throw err; });

// Путь к директории файлов ресурсов (css, js, images)
app.use(express.static('public'))

// Настройка шаблонизатора
app.set('view engine', 'ejs')

// Путь к директории файлов отображения контента
app.set('views', path.join(__dirname, 'views'))


// Обработка POST-запросов из форм
app.use(express.urlencoded({ extended: true }))

// Инициализация сессии
app.use(session({secret: "Secret", resave: false, saveUninitialized: true}));

// Middleware
function isAuth(req, res, next) {
  if (req.session.auth) {
    next();
  } else {
    res.redirect('/');
  }
}

// Запуск веб-сервера по адресу http://localhost:3000
app.listen(3000)

/**
 * Маршруты
 */
app.get('/', (req, res) => {
  connection.query("SELECT * FROM category", (err, data, fields) => {
    if (err) throw err;

    res.render('home', {
      'category': data,
      auth: req.session.auth
    });
  });
});

app.get('/logout', (req, res) => { 
  req.session.auth = false; 
  res.redirect('/') 
});

app.get('/add', (req, res) => {
  res.render('add', {
    auth: req.session.auth
  });
});



app.get('/about-us', (req, res) => {
  res.render('about-us', {
    auth: req.session.auth
  });
});

app.get('/auth', (req, res) => {
  res.render('auth', {
    auth: req.session.auth
  });
});

app.get('/lock', isAuth, (req, res) => {
  res.render('lock', {
    auth: req.session.auth
  });
});


// КНОПКИ


app.post('/store', (req, res) => {
  connection.query(
    "INSERT INTO category (title, image, href) VALUES (?, ?, ?)",
    [[req.body.title], [req.body.image], [req.body.href]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
})

app.post('/store-add', (req, res) => {
  connection.query(
    "INSERT INTO aot (title, image, price, description) VALUES (?, ?, ?, ?)",
    [[req.body.title], [req.body.image], [req.body.price], [req.body.description]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/aot')
  });
})



app.post('/delete', (req, res) => {
  connection.query(
    "DELETE FROM items WHERE id=?;",
    [[req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
})

app.post('/home-delete', (req, res) => {
  connection.query(
    "DELETE FROM items WHERE id=?;",
    [[req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
})

app.post('/item-delete', (req, res) => {
  connection.query(
    "DELETE FROM items WHERE id=?;",
    [[req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
})

app.post('/update', (req, res) => {
  connection.query(
    "UPDATE items SET title=?, description=?, image=?  WHERE id=?;",
    [[req.body.title], [req.body.description], [req.body.image], [req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/')
  });
})


app.post('/register', (req, res) => { 
    connection.query( 
      "SELECT * FROM users WHERE name=?", 
      [[req.body.name], [req.body.password]], (err, data, fields) => { 
        if (err) throw err; 
        let salt = 10;
        let  password = req.body.password;
        if (data.length == 0) {
          bcrypt.hash(password, salt, (err, hash) => {  
                connection.query( 
                  "INSERT INTO users (name, email, password) VALUES (?,?, ?)", 
                  [[req.body.name],[req.body.email], hash], (err, data, fields) => { 
                    if (err) throw err;  
                    req.session.auth = true; 
                    res.redirect('/');
              });             
            });    
        } 
        else { 
          req.session.auth = false;
          res.redirect('/auth'); 
          console.log("This login is already occupied");
        } 
   
      })
});

app.post('/login', (req, res) => {
  connection.query(  
    "SELECT * FROM users WHERE name=?", 
      [[req.body.name]], (err, data, fields) => { 
        if (err) throw err; 
        let name= req.body.name;
        console.log(name);
        let password = req.body.password;
        console.log(password);
        let hash = "$2b$10$g8QYamUl7dDVg3ZQj5z7duMZMrB4kwSCqEBVXknCxcOpxmZDk524q";
        console.log(hash);
        if(data.length = true){
          connection.query(  
            "SELECT * FROM users WHERE name=? and password=?", 
            [[req.body.name], [req.body.password]], (err, data, fields) => { 
             
                bcrypt.compare(password, hash, (err, result) => {
                if(result == true){
                  req.session.auth = true; 
                  res.redirect('/');}
                else{
                  
                  req.session.auth = false;
                  res.redirect('/auth'); 
                }
              });
            });
        }
        else{
          
          req.session.auth = false;
          res.redirect('/auth'); 
        }
    });    
});


// КОРЗИНА

app.get('/shopping_cart', isAuth, (req, res) => {
  // connection.query(
  //   "INSERT INTO shopping_cart users VALUES ?",(err, data, fields) => {
  //     if (err) throw err;
  //     res.render('shopping_cart', {
  //         'shopping_cart': data,
  //         auth: req.session.auth
          
  //     });
     

    connection.query(
    "SELECT * FROM shopping_cart",(err, data, fields) => {
      if (err) throw err;
      res.render('shopping_cart', {
          'shopping_cart': data,
          auth: req.session.auth
          
      });
    }); 
  });  
// });

app.post('/cart_add', (req, res) => {
  connection.query(
    "SELECT * FROM shopping_cart WHERE title=?",
    [[req.body.title]], (err, data, fields) =>{
      if (err) throw err;
      if(data.length == 0){
        connection.query(
        "INSERT INTO shopping_cart (title, description, image, price, stars) VALUES (?, ?, ?, ?, ?)",
        [[req.body.title], [req.body.description], [req.body.image], [req.body.price], [req.body.stars]], (err, data, fields) => {
          if (err) throw err;   
           
        });
      }
  });
})

app.post('/cart-del', (req, res) => {
  connection.query(
    "DELETE FROM shopping_cart WHERE id=?;",
    [[req.body.id]], (err, data, fields) => {
      if (err) throw err;

      res.redirect('/shopping_cart')
  });
})
// КАТЕГОРИИ

app.get('/anime', (req, res) => {
  connection.query("SELECT * FROM anime", (err, data, fields) => {
    if (err) throw err;
    res.render('anime', {
        'anime': data,
        auth: req.session.auth
    });
  });  
});
app.get('/games', (req, res) => {
  connection.query("SELECT * FROM games", (err, data, fields) => {
    if (err) throw err;
    res.render('games', {
        'games': data,
        auth: req.session.auth
    });
  });  
});
app.get('/music', (req, res) => {
  connection.query("SELECT * FROM music", (err, data, fields) => {
    if (err) throw err;
    res.render('music', {
        'music': data,
        auth: req.session.auth
    });
  });  
});
app.get('/cartoon', (req, res) => {
  connection.query("SELECT * FROM cartoon", (err, data, fields) => {
    if (err) throw err;
    res.render('cartoon', {
        'cartoon': data,
        auth: req.session.auth
    });
  });  
});
app.get('/fanko_pop', (req, res) => {
  connection.query("SELECT * FROM fanko_pop", (err, data, fields) => {
    if (err) throw err;
    res.render('fanko_pop', {
        'fanko_pop': data,
        auth: req.session.auth
    });
  });  
});
app.get('/movies', (req, res) => {
  connection.query("SELECT * FROM movies", (err, data, fields) => {
    if (err) throw err;
    res.render('movies', {
        'movies': data,
        auth: req.session.auth
    });
  });  
});

// КАТАЛОГ

app.get('/aot', (req, res) => {
  connection.query("SELECT * FROM aot", (err, data, fields) => {
    if (err) throw err;
    res.render('aot', {
        'aot': data,
        auth: req.session.auth
    });
  });  
});
app.get('/aot/:id', (req, res) => {
  connection.query("SELECT * FROM aot WHERE id=?", [req.params.id],
    (err, data, fields) => {
      if (err) throw err;

      res.render('item', {
        'aot': data[0],
        auth: req.session.ayth
      });
  });
});
app.get('/DemonSlayer', (req, res) => {
  connection.query("SELECT * FROM DemonSlayer", (err, data, fields) => {
    if (err) throw err;
    res.render('DemonSlayer', {
        'DemonSlayer': data,
        auth: req.session.auth
    });
  });  
});
app.get('/DemonSlayer/:id', (req, res) => {
  connection.query("SELECT * FROM DemonSlayer WHERE id=?", [req.params.id],
    (err, data, fields) => {
      if (err) throw err;

      res.render('item', {
        'DemonSlayer': data[0],
        auth: req.session.ayth
      });
  });
});
app.get('/OnePanchMan', (req, res) => {
  connection.query("SELECT * FROM onepanchman", (err, data, fields) => {
    if (err) throw err;
    res.render('OnePanchMan', {
        'onepanchman': data,
        auth: req.session.auth
    });
  });  
});
app.get('/OnePanchMan/:id', (req, res) => {
  connection.query("SELECT * FROM onepanchman WHERE id=?", [req.params.id],
    (err, data, fields) => {
      if (err) throw err;

      res.render('item', {
        'onepanchman': data[0],
        auth: req.session.ayth
      });
  });
});