import Tsue from '../src/instance/index';

function Welcome () {
    return {
        name: 'welcome',
        data() {
            return {
                age: 15
            }
        },
        beforeCreate() {
            console.log('beforeCreate')
        },
        created() {
            console.log('created')
        },
        beforeMount() {
            console.log('beforeMount')
        },
        mounted() {
            console.log('mounted')
        },
        beforeUpdate() {
            console.log(this.age, 'beforeUpdate')
        },
        updated() {
            console.log(this.age, 'updated')
        },
        methods: {
            clickHandler: function() {
                this.age = this.age + 1
            }
        },
        
        render(h) {
            return (
                <div>
                    <div name='d'  class='d1' style='color:red;' key='ddd' onClick={this.clickHandler}>click to change age</div> 
                    <div>age: {this.age}</div>  
                </div>
            );
        }
    }
    
}

const tsue = new Tsue({
    el: '#app',
    data: function(){ 
        return {
            name: 'Tsue'
         }
    },
    
    render(h) {
      return ( 
        <div>
            <h1>{this.name}</h1>
            <Welcome></Welcome>
        </div>
      )
    }
})


