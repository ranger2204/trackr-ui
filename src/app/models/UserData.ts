export class UserData{
    username: string;
    token: string;
    authenticated: boolean = false;
    private password: string;

    constructor(){
        this.username = '';
        this.authenticated = false;
        this.token = '';
        this.password = '';
    }

    authenticate(token:string){
        this.token = token
        this.password = ''
        this.authenticated = true;
    }

    invalidate(){
        this.username = '';
        this.authenticated = false;
        this.token = '';
    }
}