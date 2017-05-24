<?php

use Illuminate\Database\Seeder;
use App\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UsersTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {

        $roleAdmin  =   Role::create(['name'=>'Admin']);
        $roleManager =  Role::create(['name'=>'Manager']);
        $roleSeller =   Role::create(['name'=>'Seller']);
        $roleCustomer = Role::create(['name'=>'Customer']);
        $roleProvider = Role::create(['name'=>'Provider']);   
        
        Permission::create(['name'=> 'access_backend']);
        Permission::create(['name'=> 'view_pos']);
        Permission::create(['name'=> 'view_reports']);
        Permission::create(['name'=> 'view_stock']);
        Permission::create(['name'=> 'edit_users']);
        Permission::create(['name'=> 'view_checkout']);
        Permission::create(['name'=> 'edit_products']);
        //Permission::create(['name'=> 'edit_products']);
        
        $Admin = User::create(['name' => 'Edison Delgado', 'email'=> 'edisonsk@gmail.com', 'password'=>bcrypt('01902Qwe')]);
        $Manager = User::create(['name' => 'Anibaldo Delgado', 'email'=> 'anibaldo@ferreteriadelmar.cl', 'password'=>bcrypt('gutierrez1960')]);
        
        $Admin->assignRole('Admin');
        $Manager->assignRole('Admin');
        
    }
}
