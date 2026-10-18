import {adminClient} from '../catalog/repository.js';
export async function currentAdmin(){
 if(!adminClient)return null;
 const {data:{user},error}=await adminClient.auth.getUser();
 if(error||!user)return null;
 const {data,error:profileError}=await adminClient.from('rj_admin_profiles').select('id,active').eq('id',user.id).eq('active',true).maybeSingle();
 if(profileError)throw Error('Não foi possível verificar o acesso administrativo. Confira a configuração do banco.');
 return data?user:null;
}
export async function signIn(email,password){
 const {error}=await adminClient.auth.signInWithPassword({email:email.trim(),password});
 if(error)throw Error('Não foi possível entrar. Confira email e senha ou aguarde antes de tentar novamente.');
 try{const user=await currentAdmin();if(!user)throw Error('Este usuário não possui acesso administrativo ativo.');return user;}
 catch(error){await adminClient.auth.signOut({scope:'local'});throw error;}
}
export async function signOut(){
 const {error}=await adminClient.auth.signOut({scope:'local'});if(error)throw Error('Não foi possível sair. Tente novamente.');
}
