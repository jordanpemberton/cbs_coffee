module.exports = function(){
    var express = require('express');
    var router = express.Router();

    // Get all orders:
    function getOrders(res, mysql, context, complete){
        var sql = "SELECT order_id AS id, order_date, ship_date, customer_id, ship_firstname, ship_lastname, ship_address, ship_city, ship_zip, ship_phone, order_subtotal, order_shipcost, order_totalcost, order_quantity FROM cbs_orders"
        mysql.pool.query(sql, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end()
            }
            context.orders = results
            complete();
        });
    }
  

    // Get one specific order to update it:
    function getOrder(res, mysql, context, id, complete) {
        var sql = "SELECT order_id AS id, order_date, ship_date, customer_id, ship_firstname, ship_lastname, ship_address, ship_city, ship_zip, ship_phone, order_subtotal, order_shipcost, order_totalcost, order_quantity FROM cbs_orders WHERE order_id=?"
        var inserts = [id];
        mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            context.order = results[0];
            complete();
        });
    }


    // Show all existing entries in Order Details table:
    function getOrderDetails(res, mysql, context, complete) {
        var sql = "SELECT order_id, product_id, product_quantity FROM cbs_orderdetails";
        mysql.pool.query(sql, function (error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end()
            }
            context.orderdetails = results
            complete();
        });
    }



    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteOrder.js"];
        var mysql = req.app.get('mysql');
        var handlebars_file = 'orders'
        getOrders(res, mysql, context, complete);
        getOrderDetails(res, mysql, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount >= 2){
                res.render(handlebars_file, context);
            }
        }
    });


    // Retrieves one specific order to UPDATE:
    router.get('/:id', function (req, res) {
        callbackCount = 0;
        var context = {};
        context.jsscripts = ["updateOrder.js"];
        var mysql = req.app.get('mysql');
        getOrder(res, mysql, context, req.params.id, complete);
        function complete() {
            callbackCount++;
            if (callbackCount >= 1) {
                res.render('update-order', context);
            }
        }
    });

    // to INSERT an order:
    router.post('/', function (req, res) {
        var mysql = req.app.get('mysql');
        var sql = "INSERT INTO cbs_orders (order_date, customer_id, ship_firstname, ship_lastname, ship_address, ship_city, ship_zip, ship_phone, order_subtotal, order_shipcost, order_totalcost, order_quantity) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
        var inserts = [req.body.order_date, req.body.customer_id, req.body.ship_firstname, req.body.ship_lastname, req.body.ship_address, req.body.ship_city, req.body.ship_zip, req.body.ship_phone, req.body.order_subtotal, req.body.order_shipcost, req.body.order_totalcost, req.body.order_quantity];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/orders');
            }
        });
    });


    // To update an order:
    router.put('/:id', function (req, res) {
        var mysql = req.app.get('mysql');
        console.log(req.body)
        console.log(req.params.id)
        var sql = "UPDATE cbs_orders SET order_date=?, ship_date=?, customer_id=?, ship_firstname=?, ship_lastname=?, ship_address=?, ship_city=?, ship_zip=?, ship_phone=? WHERE order_id=?"
        var inserts = [req.body.order_date, req.body.ship_date, req.body.customer_id, req.body.ship_firstname, req.body.ship_lastname, req.body.ship_address, req.body.ship_city, req.body.ship_zip, req.body.ship_phone, req.params.id];
        sql = mysql.pool.query(sql, inserts, function (error, results, fields) {
            if (error) {
                console.log(error)
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.status(200);
                res.end();
            }
        });
    });


    // to DELETE an order
    router.delete('/:id', function(req, res){
        var mysql = req.app.get('mysql');
        var sql = "DELETE FROM cbs_orders WHERE order_id = ?";
        var inserts = [req.params.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                console.log(error)
                res.write(JSON.stringify(error));
                res.status(400); 
                res.end(); 
            }else{
                res.status(202).end();
            }
        })
    })

    return router;
}();