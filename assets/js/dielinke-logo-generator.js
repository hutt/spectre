async function generateLogo(websiteName, color) {
    // Array logoText: Contains string
    // Object color: Color pairs for the logo
    /// color.background
    /// - "#6F003C" (dark red)
    /// - "#004B5B" (dark green)
    /// - "#8100A1" (violet)
    /// - "#2E4FC4" (blue)
    ///
    /// color.text
    /// - "#FFFFFF" (white)
    ///
    /// color.logoText
    /// - "#FFFFFF" (white)

    // Constants
    const BACKDROP_MIN_HEIGHT = 65;
    const BACKDROP_Y = 41;
    const TEXT_START_Y = BACKDROP_Y + 48;
    const MIN_FONT_SIZE = 10;
    const MAX_FONT_SIZE = 17;
    const MAX_WIDTH = 106;
    const MAX_LENGTH_PER_LINE = 20;
    const MAX_LINES = 3;

    // Decode escaped HTML Characters in title
    function decodeHTMLEntities(text) {
        const entityMap = {
            '&shy;': '­', // Soft hyphen
            '&ndash;': '–', // En dash
            '&mdash;': '—', // Em dash
            '&comma;': ',', // Comma
            '&amp;': '&', // Ampersand
            '&#40;': '(', // Left parenthesis
            '&#41;': ')', // Right parenthesis
            '&ldquo;': '„', // German opening double quotation mark
            '&rdquo;': '"', // German closing double quotation mark
            '&lsquo;': '‚', // German opening single quotation mark
            '&rsquo;': "'", // German closing single quotation mark
            '&quot;': '"', // Straight double quotation mark
            '&#39;': "'", // Straight single quotation mark
            '&laquo;': '«', // Left-pointing double angle quotation mark
            '&raquo;': '»' // Right-pointing double angle quotation mark
        };

        return text.replace(/&shy;|&ndash;|&mdash;|&comma;|&amp;|&#40;|&#41;|&ldquo;|&rdquo;|&lsquo;|&rsquo;|&quot;|&#39;|&laquo;|&raquo;/g, (match) => entityMap[match] || match);
    }

    // Function to split text into lines
    function splitIntoLines(text) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';

        function hyphenateGermanWord(word) {
            const prefixes = ['ab', 'an', 'auf', 'aus', 'ein', 'mit', 'nach', 'über', 'um', 'un', 'vor', 'zu'];
            const suffixes = ['heit', 'keit', 'ung', 'schaft'];

            for (const prefix of prefixes) {
                if (word.startsWith(prefix) && word.length > prefix.length + 3) {
                    return [prefix, ...hyphenateGermanWord(word.slice(prefix.length))];
                }
            }

            for (const suffix of suffixes) {
                if (word.endsWith(suffix) && word.length > suffix.length + 3) {
                    return [...hyphenateGermanWord(word.slice(0, -suffix.length)), suffix];
                }
            }

            if (word.length <= MAX_LENGTH_PER_LINE) {
                return [word];
            }

            const vowels = 'aeiouäöüAEIOUÄÖÜ';
            let lastVowelIndex = -1;
            for (let i = 1; i < word.length - 1; i++) {
                if (vowels.includes(word[i])) {
                    lastVowelIndex = i;
                }
                if (i >= MAX_LENGTH_PER_LINE - 1) {
                    if (lastVowelIndex > 0) {
                        return [word.slice(0, lastVowelIndex + 1), ...hyphenateGermanWord(word.slice(lastVowelIndex + 1))];
                    }
                    return [word.slice(0, MAX_LENGTH_PER_LINE - 1), ...hyphenateGermanWord(word.slice(MAX_LENGTH_PER_LINE - 1))];
                }
            }
            return [word];
        }

        for (const word of words) {
            if ((currentLine + (currentLine ? ' ' : '') + word).length <= MAX_LENGTH_PER_LINE) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                if (currentLine) {
                    lines.push(currentLine);
                    currentLine = word;
                } else {
                    // Word is longer than MAX_LENGTH_PER_LINE
                    let remainingWord = word;
                    while (remainingWord.length > MAX_LENGTH_PER_LINE) {
                        lines.push(remainingWord.slice(0, MAX_LENGTH_PER_LINE - 1) + '-');
                        remainingWord = remainingWord.slice(MAX_LENGTH_PER_LINE - 1);
                    }
                    currentLine = remainingWord;
                }
            }
        }

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    }


    // decode some escaped HTML characters
    websiteName = decodeHTMLEntities(websiteName);

    // Split website name into lines
    const logoText = splitIntoLines(websiteName);

    // Check number of lines
    if (logoText.length > MAX_LINES) {
        throw new Error(`Der Websitename ist zu lang. Maximal ${MAX_LINES} Zeilen mit je ${MAX_LENGTH_PER_LINE} Zeichen sind erlaubt.`);
    }

    let textToSvg = null;
    let boxHeight = BACKDROP_MIN_HEIGHT;

    // Load font
    textToSvg = await TextToSVG.load("/assets/fonts/inter-cyrillic_greek_latin_latin-ext-500.ttf");

    // Calculate font size and adjust text
    let fontSize = MAX_FONT_SIZE;
    const pathParams = {
        fontSize,
        letterSpacing: -0.01,
    };

    const longestLine = logoText.reduce((a, b) => textToSvg.getWidth(a, pathParams) > textToSvg.getWidth(b, pathParams) ? a : b, '');

    while (textToSvg.getWidth(longestLine, pathParams) > MAX_WIDTH) {
        fontSize -= 0.01;
        pathParams.fontSize = fontSize;
        if (fontSize < MIN_FONT_SIZE) {
            fontSize = MIN_FONT_SIZE;
            break;
        }
    }

    // Generate SVG for each line of text
    const fontTopAdjustment = (12 * (fontSize / MAX_FONT_SIZE));
    const fontHeight = textToSvg.getHeight(fontSize);
    const realLines = logoText.map((line, index) => {
        const y = (index * (fontHeight - 1)) + TEXT_START_Y + fontTopAdjustment;
        return {
            text: line,
            path: textToSvg.getD(line, {
                x: 178,
                anchor: 'right',
                y,
                ...pathParams,
                fontSize
            }),
            fontSize,
            y
        };
    });

    // Calculate box height
    boxHeight = realLines.length ? realLines[realLines.length - 1].y - BACKDROP_Y + 12 : BACKDROP_MIN_HEIGHT;

    // Construct SVG string
    let svg = `<svg viewBox="0 0 ${188} ${40 + boxHeight}" width="188" height="${40 + boxHeight}" aria-labelledby="logoTitle" role="img" xmlns="http://www.w3.org/2000/svg">`;
    svg += `<title id="logoTitle">Logo der Partei Die Linke.</title>`;
    svg += `<g>`;

    if (color.background !== 'transparent') {
        svg += `<rect id="backdrop" x="41" y="${BACKDROP_Y}" height="${boxHeight}" width="149" fill="${color.background}"></rect>`;
    }

    realLines.forEach(line => {
        svg += `<path d="${line.path}" fill="${color.text}"/>`;
    });

    // Append the combined SVG with other SVGs if needed
    svg += `
        <g transform="scale(1.02)">
            <path id="keil" d="M175 56.135L0 86.9925V30.8575L175 0V56.135Z" fill="${color.keil || '#FF0000'}"/>
            <g id="linke-schriftzug">
                <path id="Vector"
                      d="M34.7823 46.0198C33.4673 44.4048 31.8048 43.2048 29.7923 42.4248C27.7798 41.6448 25.5448 41.4698 23.0848 41.9048L15.4023 43.2598L15.4198 70.9798L25.5598 69.1923C28.2998 68.7098 30.6398 67.5648 32.5773 65.7573C34.5148 63.9498 35.9048 61.7923 36.7423 59.2798C37.5798 56.7698 37.7723 54.2323 37.3223 51.6723C36.9423 49.5223 36.0948 47.6373 34.7823 46.0223V46.0198ZM30.0323 57.4923C29.6673 58.8648 29.0273 60.0323 28.1148 60.9998C27.2023 61.9673 26.1198 62.5598 24.8648 62.7823L22.3673 63.2223L22.3973 48.5623L23.9723 48.2848C25.0223 48.0998 25.9998 48.2123 26.9023 48.6198C27.8073 49.0298 28.5373 49.6523 29.0948 50.4898C29.6523 51.3298 30.0273 52.2998 30.2223 53.3998C30.4623 54.7573 30.3998 56.1223 30.0323 57.4923Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_2"
                      d="M45.3066 37.1326C44.5691 36.6151 43.7391 36.4401 42.8166 36.6026C42.1241 36.7251 41.4941 37.0076 40.9266 37.4501C40.3591 37.8926 39.9666 38.4376 39.7491 39.0826C39.5316 39.7276 39.4841 40.3826 39.6016 41.0501C39.7591 41.9476 40.1941 42.6551 40.9066 43.1776C41.6191 43.7001 42.4741 43.8726 43.4741 43.6951C44.1141 43.5826 44.7116 43.3051 45.2691 42.8651C45.8266 42.4251 46.2241 41.8776 46.4666 41.2276C46.7091 40.5776 46.7691 39.9076 46.6466 39.2151C46.4941 38.3451 46.0466 37.6501 45.3091 37.1351L45.3066 37.1326Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_3"
                      d="M39.957 46.4154L39.9995 66.6453L46.337 65.5278L46.2945 45.2979L39.957 46.4154Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_4"
                      d="M82.9119 31.3555L75.9219 32.588L75.9394 60.308L93.7993 57.158L93.8118 50.2655L82.9419 52.183L82.9119 31.3555Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_5"
                      d="M122.918 35.7077C122.273 34.4477 121.346 33.5227 120.131 32.9327C118.918 32.3402 117.518 32.1852 115.931 32.4652C114.856 32.6552 113.921 33.0502 113.131 33.6527C112.338 34.2552 111.726 34.9627 111.288 35.7802L111.096 35.8152L110.188 34.0352L105.578 34.8477L105.621 55.0777L111.958 53.9602L111.933 42.3602C111.933 41.7527 112.023 41.1827 112.206 40.6477C112.388 40.1152 112.686 39.6977 113.096 39.4027C113.506 39.1077 113.941 38.9177 114.401 38.8352C115.016 38.7277 115.556 38.7902 116.018 39.0252C116.481 39.2602 116.818 39.6352 117.031 40.1527C117.241 40.6702 117.361 41.2427 117.393 41.8702L117.413 52.9952L123.903 51.8502V40.1677C123.891 38.4527 123.563 36.9677 122.918 35.7077Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_6"
                      d="M144.483 27.9847L137.301 29.2497L132.933 37.9647L132.946 22.5322L126.608 23.6497L126.586 51.3772L132.926 50.2597L132.931 41.4522L137.841 49.3922L144.948 48.1397L138.826 38.8722L144.483 27.9847Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_7"
                      d="M96.2891 36.4827L96.3316 56.7127L102.669 55.5952L102.627 35.3652L96.2891 36.4827Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_8" d="M108.144 19.46L91.2617 29.3275L99.0392 33.5325L108.144 19.46Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_9"
                      d="M162.969 35.0796C162.979 34.4571 162.932 33.8521 162.827 33.2621C162.524 31.5471 161.864 30.0846 160.847 28.8796C159.829 27.6721 158.607 26.8196 157.187 26.3171C155.764 25.8146 154.259 25.7046 152.672 25.9846C150.674 26.3371 148.939 27.2046 147.467 28.5846C145.994 29.9671 144.939 31.6321 144.307 33.5771C143.674 35.5246 143.522 37.4446 143.857 39.3396C144.169 41.1071 144.839 42.6246 145.869 43.8946C146.899 45.1646 148.142 46.0746 149.599 46.6221C151.054 47.1696 152.654 47.2921 154.397 46.9846C155.882 46.7221 157.197 46.2146 158.344 45.4571C159.492 44.6996 160.439 43.7471 161.187 42.5996C161.792 41.6721 162.247 40.7296 162.572 39.7721H156.449C156.204 40.1846 155.859 40.5821 155.412 40.9646C154.964 41.3471 154.394 41.5996 153.704 41.7221C153.064 41.8346 152.452 41.7771 151.872 41.5496C151.289 41.3221 150.824 40.9296 150.477 40.3696C150.244 39.9996 150.062 39.5596 149.917 39.0621L162.854 36.7821C162.922 36.2696 162.962 35.6996 162.969 35.0796ZM149.722 35.2171C149.727 35.1896 149.727 35.1621 149.732 35.1346C149.919 34.0996 150.304 33.2196 150.889 32.4946C151.474 31.7721 152.202 31.3321 153.074 31.1796C153.739 31.0621 154.352 31.1196 154.907 31.3521C155.462 31.5846 155.909 31.9471 156.247 32.4421C156.562 32.9046 156.772 33.4096 156.884 33.9546L149.722 35.2171Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
                <path id="Vector_10"
                      d="M65.697 45.658C64.677 44.4505 63.4595 43.598 62.037 43.0955C60.6145 42.593 59.1095 42.483 57.522 42.763C55.5245 43.1155 53.7895 43.983 52.317 45.363C50.8445 46.7455 49.792 48.408 49.157 50.3555C48.5245 52.303 48.3745 54.223 48.707 56.118C49.0195 57.8855 49.6895 59.403 50.7195 60.673C51.7495 61.943 52.992 62.853 54.447 63.403C55.9045 63.9505 57.502 64.073 59.2445 63.7655C60.7295 63.503 62.0445 62.9955 63.192 62.238C64.3395 61.4805 65.287 60.528 66.0345 59.3805C66.6395 58.453 67.097 57.508 67.4195 56.553H61.297C61.052 56.9655 60.707 57.363 60.2595 57.7455C59.812 58.128 59.242 58.3805 58.552 58.503C57.912 58.6155 57.2995 58.558 56.7195 58.3305C56.137 58.103 55.672 57.7105 55.3245 57.1505C55.092 56.7805 54.9095 56.3405 54.7645 55.843L67.702 53.563C67.7695 53.0505 67.807 52.483 67.817 51.8605C67.827 51.238 67.7795 50.633 67.6745 50.043C67.372 48.328 66.712 46.8655 65.6945 45.6605L65.697 45.658ZM54.572 51.9955C54.577 51.968 54.577 51.9405 54.582 51.913C54.7695 50.878 55.1545 49.998 55.7395 49.273C56.3245 48.5505 57.052 48.1105 57.9245 47.958C58.5895 47.8405 59.202 47.898 59.757 48.1305C60.312 48.363 60.7595 48.7255 61.097 49.2205C61.412 49.683 61.622 50.188 61.7345 50.733L54.572 51.9955Z"
                      fill="${color.logoText || '#FFFFFF'}"/>
            </g>
        </g>`;

    // Append other elements or groups if needed
    svg += `</g></svg>`;

    // Remove whitespaces, tabs & newlines
    svg = svg.replace(/\s+/g, " ");
    // Remove whitespaces between html tags
    svg = svg.replace(/> </g, "><");

    let placeholderLogo = document.querySelector("#gh-navigation > div > div.gh-navigation-brand > a");
    placeholderLogo.innerHTML = svg;
}