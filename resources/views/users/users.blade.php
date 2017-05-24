@extends('layouts.app')
@section('content')
<section class="container-fluid">
    <div class="row">
        <div class="col-md-4 col-lg-4">
        </div>
        <div class="col-md-8 col-lg-8">
            @if($users)
            <table class="table table-hover table-bordered">
               <thead>
                    <tr>
                        <th>#</th>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Permisos</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($users as $user)
                    <tr id="{{$user->id}}">
                        <td>{{$user->id}}</td>
                        <td>{{$user->name}}</td>
                        <td>
                            <div style="padding-bottom:0px;margin:0px;" class="form-group">
                            <select class="form-control">
                                @foreach($roles as $rol)
                                    <option value="{{$rol->name}}">{{$rol->name}}</option>
                                @endforeach
                            </select>
                            </div>

                        </td>
                        <td></td>
                        <td>
                            <button class="btn btn-raised btn-danger">Eliminar</button>
                            <button class="btn btn-raised btn-info">Editar</button>
                        </td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @endif
        </div>
    </div>
</section>
@endsection