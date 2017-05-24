@extends('layouts.app') @section('content')
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-6 ">
                <div class="jumbotron">
                    <h3 class="text-center bg-primary" style="font-weight: 400; padding: 10px; margin-top: 0px; text-transform: uppercase">Ventas del Día</h3>
                    <h2 class="text-right">Total Día <strong class="text-danger">$ {{number_format($totalDay,0,",",".")}}</strong>
                    </h2>
                    <h3 class="text-right">Nº de Ventas <strong class="text-info">{{count($sales)}}</strong></h3>
                </div>
            </div>

            <div class="col-md-6 ">
                <div class="jumbotron">
                    <h3 class="text-center bg-success" style="font-weight: 400; padding: 10px; margin-top: 0px; text-transform: uppercase;" >Ventas del Mes</h3>
                    <h2 class="text-right">Total Mes <strong class="text-danger">$ {{number_format($totalMonth,0,",",".")}}</strong>
                    </h2>
                    <h3 class="text-right">Nº de Ventas <strong class="text-info">{{count($salesMonth)}}</strong></h3>
                </div>

            </div>

            <div class="col-md-12">
                <div class="jumbotron">

                </div>
            </div>

        </div>

    </div>
@endsection




