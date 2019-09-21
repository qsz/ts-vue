import Tsue from '../src/instance/index';
function Hello1() {
    return {
        name: 'Hello1',
        beforeDestroy() {
        console.log('beforeDestroy', this)
    },
    destroyed() {
        console.log('destroyed', this)
    },
        render(h) {
            return (
                <h1>hello1</h1>
            )
        }
    }
}

function Hello2() {
    return {
        name: 'Hello2',
        render(h) {
            return (
                <h2>hello2</h2>
            )
        }
    }
}

function Hello3() {
    return {
        name: 'Hello3',
        render(h) {
            return (
                <h3>hello3</h3>
            )
        }
    }
}


function Welcome () {
    return {
        name: 'welcome',
        data() {
            return {
                age: 15,
                list: {
                    a: 11,
                    b: 22,
                    c: 33,
                    d: 44
                },
                css: 'color:red; font-size: 25px'
            }
        },
        methods: {
            clickHandler1: function() {
                this.age = this.age + 1
                this.css = 'color: blue;  font-size: 25px'
            },
            clickHandler2: function() {
                this.list = {
                    d: 44,
                    a: 11,
                    b: 22,
                    c: 33
                }
            }
        },
        
        render(h) {
            return (
                <div>
                    <button onClick={this.clickHandler1}>click to change age</button> 
                    <button onClick={this.clickHandler2}>click to change list</button> 

                    <div style={this.css} >age: {this.age}</div>  
                

                    {
                        Object.keys(this.list).map((key) => {
                            return <li key={key}>{this.list[key]}</li>
                        })
                    }
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


