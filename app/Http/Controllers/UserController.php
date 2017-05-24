<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\User as User;
use App\Http\Requests;
use Spatie\Permission\Models\Role as Role;
use Spatie\Permission\Models\Permission as Permission;
use DB as DB;

class UserController extends Controller
{
    //
    public function getView(){
        $users = DB::table('users')->paginate(12);
        $roles = DB::table('roles')->get();
        foreach($users as $user){
            //$user->role = 
        }
        return view('users.users', ['users'=>$users,'roles'=>$roles]);
    }
}
