            window.onbeforeunload = function() {
                return "Dude, are you sure you want to leave? Think of the kittens!";
            }
           
                var currentItem = '',
                    table = $('#note_table_body');
                var saleTable = new tableRow(table);
                
                
                $("#find_product").autocomplete({
                    source: function(req, res){
                        $.getJSON(
                                window.location.pathname + "/product/find/",
                                {find:$('#find_product').val()},
                                res
                        );
                    },
                    minLength: 4,
                    select: function( event, ui ) {
                        $('#add_product').hide();
                        currentItem = ui.item;

                        var stock = ui.item.stock == null? 'sin stock': ui.item.stock,
                            price = ui.item.price == null? 'sin precio': ui.item.price,
                            html = '<div id="current_item" class="">'+
                                        '<h3>'+ui.item.name+'</h3>'+
                                        '<div class="text-right">'+   
                                            '<h2><strong>$ '+$.number( price, 0, ',', '.' )+'</strong></h2>'+
                                            '<h4>'+stock+' unid.</h4>'+           
                                        '</div>'+
                                    '</div>';
                        //**//
       
                        $('#single_product_detail').html(html);
                       /* if(currentItem.stock <= 0)
                            $('#add_product').hide();
                        else*/
                            $('#add_product').show();
                        //alert(ui.item.value);
                    }
                });
                
                $("#add_product").click(function(){
                    //console.log(currentItem.stock);
                    saleTable.addRow(currentItem);  
                    $('#current_item').remove();
                    $('#find_product').val('');
                    $('#add_product').hide();
                    currentItem = '';
                    
                });
        
                /***/
                function tableRow(table){
                    
                    var table = table;
                    var rows = []; 
                    var total = $('#sale_total');
                    
                    this.updateRow = function(action){
                        var amount = 0;   
                        $.each(rows, function(index, row){

                            amount = amount + row.total;

                        });
                        var html = "$ " +$.number(amount,0,',','.');
                        console.log(html);
                        total.html(html);
                    },
                        
                    this.addRow = function(item){
                        var row = {
                            item: item,
                            id : new Date().getTime(),
                            total: 1*item.price
                        }
                        var total = 1*item.price;
                        var html = 
                            '<tr id="'+row.id+'" class="info">'+
                                '<td id="">'+item.name+'</td>'+
                                '<td id="qty_'+row.id+'">'+1+'</td>'+  
                                '<td id="price_'+row.id+'">'+$.number( item.price, 0, ',', '.' )+'</td>'+
                                '<td id="total_'+row.id+'">'+$.number( total, 0, ',', '.' )+'</td>'+ 
                                '<td><div class="btn-group-sm"><button id="delete_'+row.id+'" onclick="saleTable.deleteRow('+row.id+')" class="btn btn-danger btn-fab"><i class="material-icons">delete</i></button></div></td>'+ 
                            '</tr>';
                        rows.push(row);
                        table.append(html);
                        this.updateRow();
                    },
                    this.deleteRow = function(id){
                        var row = this.getRow(id);
                        var index = rows.indexOf(row);
                        console.log(index + JSON.stringify(row));
                        rows.splice(index, 1);
                        $('#'+id).remove();
                        this.updateRow();
                    },
                    this.getRow = function(id){
                        for(i=0;i<rows.length;i++){
                            console.log(i);
                            if(id === rows[i].id)
                                return rows[i];
                        }
                        return -1;
                    }
                };






