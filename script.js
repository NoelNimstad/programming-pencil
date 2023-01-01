const iframe_parent = document.getElementById('results');
const iframe = document.getElementById('window');
const editors_parent = document.getElementById('editors');
const editors = document.getElementsByClassName('editor');
const html_editor = editors[0];
const css_editor = editors[1];
const js_editor = editors[2];

function update()
{
    iframe.contentDocument.body.innerHTML = `
    ${ html_editor.value }
    <style>
    ${ css_editor.value }
    </style>
    `;

    iframe.contentWindow.eval(js_editor.value);
}

for(let editor of editors)
{
    editor.style.height = `${ window.innerHeight / 4 }px`

    editor.addEventListener('keydown', e => 
    {
        if(e.key === "Tab")
        {
            e.preventDefault();
            const start = editor.selectionStart;
            const end = editor.selectionEnd;
            editor.value = editor.value.substring(0, start) + "\t" + editor.value.substring(end);
            editor.selectionStart = editor.selectionEnd = start + 1;
        }
    });

    editor.addEventListener('input', e => 
    {
        update();       
    });
}

let fullscreen = false;
const fullscreen_toggle = document.getElementById('fullscreen');
fullscreen_toggle.addEventListener('click', () => 
{
    fullscreen = !fullscreen;
    editors_parent.style.display = fullscreen ? "none" : "block";
    iframe.style.width = `${ 50 * fullscreen + 50 }vw`; 
    iframe_parent.style.width = `${ 50 * fullscreen + 50 }vw`; 
    update();
});

function download() // original download function from https://stackoverflow.com/a/18197341 
{
    let download_link = document.createElement('a');
    download_link.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(`<html><head><style>${ css_editor.value }</style></head><body>${ html_editor.value }<script>${ js_editor.value }</script></body>`));

    download_link.setAttribute('download', "document.html");
    download_link.style.display = 'none';

    document.body.append(download_link);
  
    download_link.click();
  
    document.body.removeChild(download_link);
}

const download_button = document.getElementById("download");
download_button.addEventListener('click', () => download())

const load_file_button = document.getElementById('load-file');
const file_input = document.getElementById('file-selector');

load_file_button.addEventListener('click', () => 
{
    file_input.click();
})

file_input.addEventListener('change', i => 
{
    const reader = new FileReader();
    reader.addEventListener('load', e => 
    { 
        const result = atob(e.target.result.replace("data:text/html;base64,", ""));
        const html = result.replace(/((.|\n)*)\<body\>((.|\n)*)\<script\>((.|\n)*)/g, "$3");
        const css = result.replace(/((.|\n)*)\<style\>((.|\n)*)\<\/style\>((.|\n)*)/g, "$3");
        const js = result.replace(/((.|\n)*)\<script\>((.|\n)*)\<\/script\>((.|\n)*)/g, "$3");
        html_editor.value = html;
        css_editor.value = css;
        js_editor.value = js;
        update();
    })
    reader.readAsDataURL(i.target.files[0]);
});
