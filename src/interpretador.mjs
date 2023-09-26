const op = {
    'Add': (lhs, rhs) => lhs + rhs,
    'Sub': (lhs, rhs) => lhs - rhs,
    'Mul': (lhs, rhs) => lhs * rhs,
    'Div': (lhs, rhs) => lhs / rhs,
    'Rem': (lhs, rhs) => lhs % rhs,
    'Eq': (lhs, rhs) => lhs === rhs,
    'Neq': (lhs, rhs) => lhs !== rhs,
    'Lt': (lhs, rhs) => lhs < rhs,
    'Gt': (lhs, rhs) => lhs > rhs,
    'Lte': (lhs, rhs) => lhs <= rhs,
    'Gte': (lhs, rhs) => lhs >= rhs,
    'And': (lhs, rhs) => lhs && rhs,
    'Or': (lhs, rhs) => lhs || rhs
}

export function evaluate(exp, { call_kind, environment }) {
    switch (exp.kind) {
        case 'Closure':
            if (call_kind === "Print") return "<#closure>"
            break;
        case 'Tuple':
            const first = evaluate(exp.first, { environment })
            const second = evaluate(exp.second, { environment })
            if (call_kind === "Print") return `(${first}, ${second})`
            return { ...exp, first, second }
        case 'First':
            if (exp.value.kind === "Tuple") return exp.value.first
            throw new Error(`${exp.kind} não é compativel com ${exp.value.kind}`)
        case 'Second':
            if (exp.value.kind === "Tuple") return exp.value.second
            throw new Error(`${exp.kind} não é compativel com ${exp.value.kind}`)
        case 'Int':
            return exp.value
        case 'Str':
            return exp.value
        case 'Bool':
            return exp.value
        case 'Print':
            const print_result = evaluate(exp.value, { call_kind: exp.kind, environment })
            console.log(print_result)
            return print_result
        case 'Let':
            environment[exp.name.text] = evaluate(exp.value, { environment })
            break;
        case 'Var':
            const call_kind_var = (call_kind === "Print") ? call_kind : exp.kind
            const keys = Object.keys(environment)
            for (const key of keys) {
                if (key === exp.text) {
                    return evaluate(environment[exp.text], { call_kind: call_kind_var, environment })
                }
            }
            throw new Error(`Variável não declarada ${exp.text}`)
        case 'Call':
            const call_function = environment[exp.callee.text]

            if (call_function) {
                const call_result = call_function(exp.arguments, environment)
                return call_result
            } else {
                exp.arguments.map(item => evaluate(item, environment))
            }
            break
        case 'Function':
            const parameters_func = exp.parameters.map(item => item.text)
            return (call_arguments, environment) => {
                if (call_arguments.length !== parameters_func.length) {
                    throw new Error(`Quantidade de parametros invalida!`)
                }

                const environment_func = { ...environment }
                parameters_func.forEach((item, index) => {
                    environment_func[item] = evaluate(call_arguments[index], { environment })
                })

                return evaluate(exp.value, { environment: environment_func })
            }
        case 'Binary':
            const lhs = evaluate(exp.lhs, { environment })
            const rhs = evaluate(exp.rhs, { environment })

            const op_keys = Object.keys(op)
            for (const key of op_keys) {
                if (key === exp.op) {
                    return op[exp.op](lhs, rhs)
                }
            }

            throw new Error(`Operação binaria "${exp.op}" invalida!`)
        case 'If':
            const condition = evaluate(exp.condition, { environment })
            if (condition) {
                return evaluate(exp.then, { environment })
            } else {
                return evaluate(exp.otherwise, { environment })
            }
        default:
            switch (typeof exp) {
                case 'number':
                    return exp
                case 'string':
                    return exp
                case 'boolean':
                    return exp
            }

            throw new Error(`kind "${exp.kind}" não existe`)
    }

    if (exp.next) {
        return evaluate(exp.next, { environment })
    }
}

export default {
    evaluate
}