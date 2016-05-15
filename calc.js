var Root = React.createClass({
    render: function() {
        var items = new Set()
        this.state.data.recipes.forEach(function(recipe) {
            Object.keys(recipe.results).forEach(function(res) {
                items.add(res)
            })
        })
        var components = <div />
        if (this.state.selection != undefined) {
            components = <ComponentsOf component={this.state.selection}
                            amount={this.state.amount}
                            data={this.state.data}/>
        }
        return (
            <div>
                <TargetSelection items={Array.from(items)}
                 onTargetSelectionChanged={this.onTargetSelectionChanged}/>
                 {components}
            </div>
        )
    },
    getInitialState: function() {
        return {'data': {'recipes': []}}
    },
    componentDidMount: function() {
        $.ajax({
            url: this.props.url,
            dataType: 'json',
            cache: false,
            success: function(data) {
                this.setState({data: data});
            }.bind(this),
            error: function(xhr, status, err) {
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    },
    onTargetSelectionChanged: function(name, rate) {
        this.setState({'selection': name, 'amount': rate})
    }
})

var TargetSelection = React.createClass({
    render: function() {
        var options = this.props.items.map(function(item) {
            return (
                <option key={item}>{item}</option>
            );
        });
        return (
            <div>
                <label>Item:</label>
                <select
                    value={this.state.name}
                    onChange={this.handleSelectionChange}>
                        {options}
                </select>
                <br/>
                <label>Amount per second:</label>
                <input
                    type="text"
                    placeholder="rate"
                    value={this.state.rate}
                    onChange={this.handleRateChange}
                />
            </div>
        );
    },
    getInitialState: function() {
        return {'name': "", 'rate': 1};
    },
    handleSelectionChange: function(e) {
        var name = e.target.value
        this.setState({'name': name})
        this.props.onTargetSelectionChanged(name,
                this.state.rate)
    },
    handleRateChange: function(e) {
        var rate = e.target.value
        this.setState({'rate': rate})
        this.props.onTargetSelectionChanged(this.state.name,
                rate)
    }
})

var ComponentsOf = React.createClass({
    render: function() {
        this.recipe = this.computeRecipe()
        this.children = this.renderChildren()
        this.building = this.computeBuilding()
        var header = (
            <span>{this.props.amount} {this.props.component}(s) per second - Made in {this.building.count.toFixed(2)}x {this.building.name}</span>
        )
        return <div>{header}<ul>{this.children}</ul></div>
    },
    computeRecipe: function() {
        var self = this
        var recipes = this.props.data.recipes.filter(
            function(recipe, _, __) {
                return self.props.component in recipe.results
            }
        )
        return recipes[0]
    },
    computeBuilding: function() {
        var rate = this.recipe.rate * this.recipe.results[this.props.component]
        var buildings = this.props.data[this.recipe.building]
        var name = Object.keys(buildings)[0]
        var building = buildings[name]
        rate *= building.rate
        return {'name': name, 'count': this.props.amount / rate}
    },
    renderChildren: function() {
        var self = this
        return Object.keys(this.recipe.requirements).map(function(child, i) {
            return (
                <li key={child}>
                    <ComponentsOf component={child}
                        amount={self.recipe.requirements[child] * self.props.amount /
                                self.recipe.results[self.props.component]}
                        data={self.props.data} />
                </li>
            )
        })
    }
});

ReactDOM.render(
    <Root url="./stuff.json"/>,
    document.getElementById('content')
);
