<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Laravel</title>

    <!-- Fonts -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.5.0/css/font-awesome.min.css" integrity="sha384-XdYbMnZ/QjLh6iI4ogqCTaIjrFk87ip+ekIjefZch0Y+PvJ8CDYtEs1ipDmPorQ+" crossorigin="anonymous">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato:100,300,400,700">
    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/icon?family=Material+Icons">

    <!-- Styles -->
    <!--link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous"-->
    {{-- <link href="{{ elixir('css/app.css') }}" rel="stylesheet"> --}}
    {!! Html::style('www/lib/bootstrap/dist/css/bootstrap.min.css') !!}
    {!! Html::style('www/lib/bootstrap-material-design/dist/css/bootstrap-material-design.min.css') !!}
    {!! Html::style('www/lib/bootstrap-material-design/dist/css/ripples.min.css') !!}
    {!! Html::style('css/style.css') !!}
    {!! Html::style('css/jquery-ui.min.css') !!}
    {!! Html::script('www/lib/jquery/dist/jquery.min.js') !!}
    {!! Html::script('www/lib/bootstrap/dist/js/bootstrap.min.js') !!}
    {!! Html::script('js/jquery-ui.min.js') !!}
    {!! Html::style('css/toastr.min.css') !!}
    
    <style>
        body {
            font-family: 'Lato';
        }

        .fa-btn {
            margin-right: 6px;
        }
    </style>
</head>
<body id="app-layout">
    <nav id="main-menu" class="navbar navbar-default navbar-static-top">
        <div class="container-fluid">
            <div class="navbar-header">

                <!-- Collapsed Hamburger -->
                <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#app-navbar-collapse">
                    <span class="sr-only">Toggle Navigation</span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                    <span class="icon-bar"></span>
                </button>

                <!-- Branding Image -->
                <a class="navbar-brand" href="{{ url('/') }}">
                    <img src="{{url('/images/logo_delmar.png')}}">
                </a>
            </div>

            <div class="collapse navbar-collapse" id="app-navbar-collapse">
                <!-- Left Side Of Navbar -->
                <ul class="nav navbar-nav">
                    <li><a href="{{ url('/home') }}">Inicio</a></li>
                    @role(['Admin', 'Manager'])
                    <li class="dropdown">
                        
                        <a href="{{ url('/products')}}" data-target="#" class="dropdown-toggle" data-toggle="dropdown">Inventario
                                <b class="caret"></b></a>
                        <ul class="dropdown-menu">
                            <li><a href="{{ url('/products/')}}">Listado de Productos</a></li>
                            <li><a href="{{ url('/product/')}}">Agregar nuevo...</a></li>
                        </ul>
                    </li>
                    @endrole
                    @role(['Seller','Admin','Manager'])
                    <li class="dropdown">
                        <a href="#" data-target="#" class="dropdown-toggle" data-toggle="dropdown">Punto de Venta
                                <b class="caret"></b></a>
                        <ul class="dropdown-menu">
                           <li><a href="{{ url('/salenote')}}">Nota de Venta</a></li>
                            <li><a href="{{ url('/checkout')}}">Caja</a></li>
                            <!--li class="divider"></li-->
                            
                        </ul>
                    </li>
                    <li class="dropdown">
                        <a href="#" data-target="#" class="dropdown-toggle" data-toggle="dropdown">Reportes
                            <b class="caret"></b></a>
                        <ul class="dropdown-menu">
                            <li><a href="{{ url('/reports/sales')}}">Reporte de Ventas</a></li>
                            <!--li><a href="">Caja</a></li>
                            <!--li class="divider"></li-->

                        </ul>
                    </li>
                    @endrole
                </ul>

                <!-- Right Side Of Navbar -->
                <ul class="nav navbar-nav navbar-right">
                    <!-- Authentication Links -->
                    @if (Auth::guest())
                        <li><a href="{{ url('/login') }}">Acceder</a></li>
                        <li><a href="{{ url('/register') }}">Registrarse</a></li>
                    @else
                        <li class="dropdown">
                            <a href="#" class="dropdown-toggle" data-toggle="dropdown" role="button" aria-expanded="false">
                                {{ Auth::user()->name }} <span class="caret"></span>
                            </a>

                            <ul class="dropdown-menu" role="menu">
                                <li><a href="{{ url('/logout') }}"><i class="fa fa-btn fa-sign-out"></i>Salir</a></li>
                            </ul>
                        </li>
                    @endif
                </ul>
            </div>
        </div>
    </nav>

    @yield('content')

    <!-- JavaScripts -->
    <!--script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.2.3/jquery.min.js" integrity="sha384-I6F5OKECLVtK/BL+8iSLDEHowSAfUo76ZL9+kGAgTRdiByINKJaqTPH/QVNS1VDb" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script-->
    {!! Html::script('www/lib/bootstrap-material-design/dist/js/material.min.js') !!}
    {!! Html::script('www/lib/bootstrap-material-design/dist/js/ripples.min.js') !!}
    {!! Html::script('js/toastr.min.js') !!}
    {!! Html::script('js/spinner.js') !!}
    {!! Html::script('js/jquery.number.min.js') !!}
   

    {{-- <script src="{{ elixir('js/app.js') }}"></script> --}}
    <script type="text/javascript">
        $(document).on('ready', function(){
            $.material.init();
        });
    </script>
</body>
</html>
