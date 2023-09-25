const LOGS = process.env.LOGS

function log(exp, environment) {
    if (LOGS !== "ON") return
    console.log({ kind: exp.kind, environment })
}

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

export function evaluate(exp, { call_kind, environment } = { environment: {} }) {
    if (exp === null || exp === undefined) return

    switch (exp.kind) {
        case 'Closure':
            if (call_kind === "Print") return "<#closure>"
            break;
        case 'Tuple':
            const first = evaluate(exp.first, { call_kind: exp.kind, environment: { ...environment } })
            const second = evaluate(exp.second, { call_kind: exp.kind, environment: { ...environment } })
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
            const print_result = evaluate(exp.value, { call_kind: exp.kind, environment: { ...environment } })
            console.log(print_result)
            return print_result
        case 'Let':
            const let_result = evaluate(exp.value, { call_kind: exp.kind, environment: { ...environment } })
            environment[exp.name.text] = let_result
            break;
        case 'Var':
            const call_kind_var = (call_kind === "Print") ? call_kind : exp.kind
            const var_result = evaluate(environment[exp.text], { call_kind: call_kind_var, environment: { ...environment } })
            return var_result
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
                    environment_func[item] = evaluate(call_arguments[index], { call_kind: exp.kind, environment: { ...environment } })
                })

                const retorno = evaluate(exp.value, {
                    call_kind: exp.kind,
                    environment: {
                        ...environment_func
                    }
                })

                if (retorno !== undefined && retorno !== null) {
                    return retorno
                }
            }
        case 'Binary':
            const lhs = evaluate(exp.lhs, { call_kind: exp.kind, environment: { ...environment } })
            const rhs = evaluate(exp.rhs, { call_kind: exp.kind, environment: { ...environment } })

            if (lhs === undefined && rhs === undefined) {
                throw new Error(`Binary lhs ou rhs invalidos!`)
            }

            const op_func = op[exp.op]

            if (op_func !== undefined && op_func !== null) {
                const result = op_func(lhs, rhs)
                return result
            }

            throw new Error(`Operação binaria "${exp.op}" invalida!`)
        case 'If':
            const condition = evaluate(exp.condition, { call_kind: exp.kind, environment: { ...environment } })
            const if_result = condition
                ? evaluate(exp.then, { call_kind: exp.kind, environment: { ...environment } })
                : evaluate(exp.otherwise, { call_kind: exp.kind, environment: { ...environment } })
            return if_result
        default:
            // const error = JSON.stringify({
            //     message: `kind "${exp.kind}" não existe`,
            //     kind: exp.kind,
            //     location: exp.location
            // }, null, 2)
            // throw new Error(error)
            // console.error(error)
            return exp
    }

    evaluate(exp.next, { call_kind: exp.kind, environment })
}

export default {
    evaluate
}