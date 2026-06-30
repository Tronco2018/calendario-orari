let sessioni_mattina = 0;
let sessioni_pomeriggio = 0;
let tot = 0;
let ore_tot = 0;

const done_color = "rgb(130, 255, 99)";
const erased_color = "rgb(255, 122, 122)";

function convert_date(data) {
    const date = new Date(data * 1000);
    const formatted = date.toLocaleDateString("it-IT");
    return formatted;
}

function get_today_date() {
    return Math.floor(parseInt(Date.now())/1000);
}

function convert_single(element) {
    const minuti = element % 60;
    const ore = (element-minuti)/60;
    return `${ore}:${minuti == 0 ? "00" : minuti}`;
}

function convert_fascia(start, end) {
    return `${convert_single(start)} - ${convert_single(end)}`
}

async function is_erased(data) {
    const ress = await fetch('./erased.json');
    let erased = await ress.json();

    for (const element of erased) {
        if (data == element) return true;
    };
    return false;
}

async function get_erased() {
    const ress = await fetch('./erased.json');
    return await ress.json();
}

async function check_for_warning() {
    let erased = await get_erased(); // JSON
    const date = parseInt(get_today_date());
    for (const e of erased) {
        let element  = parseInt(e);
        if (date-element <= 604800 && date-element > -604800){
            const span = document.getElementById("data_annullata");
            if (span == null) return;
            span.innerText = convert_date(element);
            const warning = document.getElementById("warning");
            if (warning == null) return;
            warning.classList.remove("hidden");
            return;
        }
        else {
            const warning = document.getElementById("warning");
            if (warning == null) return;
            warning.classList.add("hidden");
        }
    }
}

function is_expired(date) {
    const now = Math.floor(Date.now()/1000);
    if (now > date) return true;
    else return false;
} 

function erased_style() {
    return `class="erased"`;
}
function done_style() {
    return `class="done"`;
}

async function display_data() {
    const table = document.getElementById("table");
    if (table == null) console.error("Failed to find table element");

    const res = await fetch('./data.json');
    let data = await res.json();
    data.reverse();

    for (const element of data) {
        const erased = await is_erased(element.data);
        const expired = is_expired(element.data);

        const tdStyle =
            erased ? erased_style() :
            (expired ? done_style() : "");

        const d = `<tr>
                    <td class="sett">Settimana ${element.settimana}</td>
                    <td ${tdStyle}>${convert_date(element.data)}</td>
                    <td ${tdStyle}>${element.tipologia}</td>
                    <td ${tdStyle}>${convert_fascia(element.start, element.end)}</td>
                    <td ${tdStyle}>${element.durata} ore</td>
                    </tr>
                    `
        table.insertAdjacentHTML('afterbegin', d);
        if (element.tipologia == 'Mattina')sessioni_mattina++;
        else sessioni_pomeriggio++;
        tot++;
        ore_tot += element.durata;
    };
    table.insertAdjacentHTML('afterbegin', `<tr class="tablehead">
                                                <td>Settimana</td>
                                                <td>Data e Giorno</td>
                                                <td>Tipologia</td>
                                                <td>Fascia Oraria</td>
                                                <td>Durata</td>
                                                </tr>`);
}

async function display_summary() {
    await display_data();
    const table = document.getElementById("summarytable");
    if (table == null) console.error("Failed to find summaryt table");
    const d = `<tr><td class="left">Sessioni di Mattina:</td><td class="right">${sessioni_mattina} incontri</td></tr>
               <tr><td class="left">Sessioni di Pomeriggio:</td><td class="right">${sessioni_pomeriggio} incontri</td></tr>
               <tr><td class="left">Numero Totale Incontri:</td><td class="right">${tot} appuntamenti pianificati</td></tr>
               <tr id="monte_ore"><td class="left">Monte Ore Complessivo:</td><td class="right">${ore_tot} Ore Totali</td></tr>`
    table.insertAdjacentHTML('afterbegin', d);
}

display_summary();
check_for_warning();