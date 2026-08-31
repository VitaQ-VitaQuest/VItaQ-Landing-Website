/* ==========================================================================
   VitaQ Sub-page Framework JS
   - Site chrome: menu overlay, FAQ accordion, scroll reveals, counters
   - Interactive product replicas, self-rendered into [data-demo] containers:
       schedule    draggable weekly mini-scheduler
       leaderboard live group-evaluation leaderboard
       checkout    registration -> payment -> confirmed flow
       finance     finance dashboard (revenue bars, live order feed)
       trip        transportation itinerary player
       ticket      seat picker + live ticket preview      (roadmap preview)
       badge       accreditation credential generator     (roadmap preview)
       progress    athlete progress rings
       capacity    camp / cohort capacity meters
   All demos are decorative product previews fed by static sample data.
   ========================================================================== */
(function () {
    'use strict';

    /* ---------------- Site chrome ---------------- */

    var menuButton = document.querySelector('.header-menu-button');
    if (menuButton) {
        menuButton.addEventListener('click', function () {
            document.body.classList.toggle('menu-open');
            var open = document.body.classList.contains('menu-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.querySelectorAll('.nav-overlay .nav-link').forEach(function (link) {
            link.addEventListener('click', function () {
                document.body.classList.remove('menu-open');
            });
        });
    }

    document.querySelectorAll('.faq-question').forEach(function (q) {
        q.addEventListener('click', function () {
            var item = q.closest('.faq-item');
            if (item) item.classList.toggle('active');
        });
    });

    var io = ('IntersectionObserver' in window)
        ? new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 })
        : null;
    document.querySelectorAll('.io-reveal').forEach(function (el) {
        if (io) io.observe(el); else el.classList.add('is-visible');
    });

    function animateCount(el) {
        var target = parseFloat(el.getAttribute('data-count') || '0');
        var suffix = el.getAttribute('data-suffix') || '';
        var prefix = el.getAttribute('data-prefix') || '';
        var dur = 1400, t0 = null;
        function frame(t) {
            if (!t0) t0 = t;
            var p = Math.min((t - t0) / dur, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            var val = target * eased;
            el.textContent = prefix + (target % 1 === 0 ? Math.round(val).toLocaleString() : val.toFixed(1)) + suffix;
            if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }
    if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) { animateCount(entry.target); cio.unobserve(entry.target); }
            });
        }, { threshold: 0.4 });
        document.querySelectorAll('.count-up[data-count]').forEach(function (el) { cio.observe(el); });
    }

    /* ---------------- Shared demo helpers ---------------- */

    var AVATAR_COLORS = ['#FF50DE', '#7F00FF', '#17A2B8', '#00C853', '#FF9500', '#5856D6', '#FF2D55', '#2980B9'];
    var PEOPLE = ['Lena K.', 'Omar S.', 'Mia T.', 'Yuto N.', 'Sara A.', 'Ivan P.', 'Noor H.', 'Ella V.'];

    function el(tag, cls, html) {
        var node = document.createElement(tag);
        if (cls) node.className = cls;
        if (html !== undefined) node.innerHTML = html;
        return node;
    }
    function avatar(name, small) {
        var initials = name.split(/[\s.]+/).filter(Boolean).map(function (s) { return s[0]; }).slice(0, 2).join('').toUpperCase();
        var hash = 0;
        for (var i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
        var a = el('span', 'app-avatar' + (small ? ' small' : ''), initials);
        a.style.background = AVATAR_COLORS[hash % AVATAR_COLORS.length];
        a.setAttribute('aria-hidden', 'true');
        return a;
    }
    function pipeList(container, attr, fallback) {
        var raw = container.getAttribute(attr);
        return raw ? raw.split('|').map(function (s) { return s.trim(); }).filter(Boolean) : fallback;
    }

    /* ---------------- 1. Mini scheduler ---------------- */

    function initSchedule(root) {
        var days = pipeList(root, 'data-days', ['Mon', 'Tue', 'Wed', 'Thu']);
        var names = pipeList(root, 'data-sessions', ['Foundations L1', 'Edges & Turns', 'Free Practice', 'Strength Block', 'Elite Squad', 'Open Session']);
        var colors = ['#FF50DE', '#7F00FF', '#17A2B8', '#00C853', '#FF9500', '#5856D6'];
        var times = ['07:30', '09:00', '16:00', '17:30', '19:00'];

        var grid = el('div', 'sched-grid');
        var cols = days.map(function (day) {
            var wrap = el('div', 'sched-day');
            wrap.appendChild(el('div', 'sched-day-label', day));
            var col = el('div', 'sched-col');
            col.setAttribute('data-day', day);
            wrap.appendChild(col);
            grid.appendChild(wrap);
            return col;
        });
        var toast = el('p', 'sched-toast');
        toast.setAttribute('role', 'status');
        root.appendChild(grid);
        root.appendChild(toast);

        function notify(msg) {
            toast.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toast._t);
            toast._t = setTimeout(function () { toast.classList.remove('show'); }, 2600);
        }

        names.forEach(function (name, i) {
            var s = el('div', 'sched-session');
            s.style.setProperty('--session-color', colors[i % colors.length]);
            s.setAttribute('draggable', 'true');
            s.setAttribute('tabindex', '0');
            s.setAttribute('role', 'button');
            s.setAttribute('aria-label', name + ' — drag or use arrow keys to move to another day');
            var enrolled = 6 + ((i * 5) % 9);
            s.appendChild(el('div', 's-time', times[i % times.length]));
            s.appendChild(el('div', 's-name', name));
            var meta = el('div', 's-meta');
            var stack = el('span', 'app-avatar-stack');
            for (var p = 0; p < 3; p++) stack.appendChild(avatar(PEOPLE[(i + p) % PEOPLE.length], true));
            meta.appendChild(stack);
            meta.appendChild(el('span', 's-count', enrolled + '/' + (enrolled + 4)));
            s.appendChild(meta);
            cols[i % cols.length].appendChild(s);

            s.addEventListener('dragstart', function (e) {
                s.classList.add('dragging');
                if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move';
            });
            s.addEventListener('dragend', function () { s.classList.remove('dragging'); });
            s.addEventListener('keydown', function (e) {
                if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                e.preventDefault();
                var idx = cols.indexOf(s.parentElement);
                var next = cols[(idx + (e.key === 'ArrowRight' ? 1 : cols.length - 1)) % cols.length];
                next.appendChild(s);
                s.focus();
                notify(name + ' moved to ' + next.getAttribute('data-day') + ' — every roster, coach and parent notified.');
            });
        });

        cols.forEach(function (col) {
            col.addEventListener('dragover', function (e) {
                e.preventDefault();
                col.classList.add('drag-over');
            });
            col.addEventListener('dragleave', function () { col.classList.remove('drag-over'); });
            col.addEventListener('drop', function (e) {
                e.preventDefault();
                col.classList.remove('drag-over');
                var dragging = root.querySelector('.sched-session.dragging');
                if (dragging && dragging.parentElement !== col) {
                    col.appendChild(dragging);
                    notify(dragging.querySelector('.s-name').textContent + ' moved to ' + col.getAttribute('data-day') + ' — every roster, coach and parent notified.');
                }
            });
        });
    }

    /* ---------------- 2. Live leaderboard ---------------- */

    function initLeaderboard(root) {
        var names = pipeList(root, 'data-athletes', PEOPLE.slice(0, 6));
        var unit = root.getAttribute('data-unit') || 'pts';
        var board = el('div', 'lb-board');
        root.appendChild(board);

        var rows = names.map(function (name, i) {
            var row = el('div', 'lb-row');
            row.appendChild(el('span', 'lb-rank', String(i + 1)));
            row.appendChild(avatar(name, true));
            row.appendChild(el('span', 'lb-name', name));
            var bar = el('span', 'lb-bar'); bar.appendChild(el('span'));
            row.appendChild(bar);
            row.appendChild(el('span', 'lb-score', '0'));
            board.appendChild(row);
            return { name: name, score: 0, row: row };
        });

        var controls = el('div', 'lb-controls');
        var btn = el('button', 'app-btn', 'Run live evaluation');
        var status = el('span', 'lb-status', 'Scores stream in as judges record entries.');
        controls.appendChild(btn);
        controls.appendChild(status);
        root.appendChild(controls);

        var running = false;
        function render() {
            var sorted = rows.slice().sort(function (a, b) { return b.score - a.score; });
            var max = Math.max(sorted[0].score, 1);
            sorted.forEach(function (r, i) {
                r.row.querySelector('.lb-rank').textContent = String(i + 1);
                r.row.querySelector('.lb-score').textContent = r.score.toFixed(1) + ' ' + unit;
                r.row.querySelector('.lb-bar > span').style.width = Math.round((r.score / max) * 100) + '%';
                board.appendChild(r.row);
            });
        }
        render();

        btn.addEventListener('click', function () {
            if (running) return;
            running = true;
            btn.disabled = true;
            rows.forEach(function (r) { r.score = 0; });
            var ticks = 0;
            status.textContent = 'Evaluation in progress…';
            var timer = setInterval(function () {
                ticks++;
                rows.forEach(function (r) { r.score += Math.random() * 9 + 1; });
                render();
                if (ticks >= 7) {
                    clearInterval(timer);
                    running = false;
                    btn.disabled = false;
                    btn.textContent = 'Run it again';
                    status.textContent = 'Final standings published to every athlete & parent instantly.';
                }
            }, 650);
        });
    }

    /* ---------------- 3. Registration / checkout flow ---------------- */

    function initCheckout(root) {
        var product = root.getAttribute('data-product') || 'Spring Championship Entry';
        var options = pipeList(root, 'data-options', ['Solo entry — Junior|68', 'Solo entry — Senior|84', 'Team relay (4 athletes)|180']);
        var currency = root.getAttribute('data-currency') || '$';

        var steps = el('div', 'co-steps');
        var dots = [0, 1, 2].map(function () { var d = el('span', 'co-step-dot'); steps.appendChild(d); return d; });
        root.appendChild(steps);

        var pane1 = el('div', 'co-pane active');
        pane1.appendChild(el('p', 'app-sub', 'Step 1 — choose a category for ' + product));
        var chosen = null;
        options.forEach(function (opt) {
            var parts = opt.split('|');
            var b = el('button', 'co-option');
            b.type = 'button';
            b.appendChild(el('span', 'app-title', parts[0]));
            b.appendChild(el('span', 'co-price', currency + parts[1]));
            b.addEventListener('click', function () {
                pane1.querySelectorAll('.co-option').forEach(function (o) { o.classList.remove('selected'); });
                b.classList.add('selected');
                chosen = { label: parts[0], price: parts[1] };
                next1.disabled = false;
            });
            pane1.appendChild(b);
        });
        var act1 = el('div', 'co-actions');
        var next1 = el('button', 'app-btn', 'Continue');
        next1.disabled = true;
        act1.appendChild(next1);
        pane1.appendChild(act1);

        var pane2 = el('div', 'co-pane');
        var pane3 = el('div', 'co-pane');
        root.appendChild(pane1); root.appendChild(pane2); root.appendChild(pane3);

        function go(idx) {
            [pane1, pane2, pane3].forEach(function (p, i) { p.classList.toggle('active', i === idx); });
            dots.forEach(function (d, i) { d.classList.toggle('done', i <= idx); });
        }

        next1.addEventListener('click', function () {
            pane2.innerHTML = '';
            pane2.appendChild(el('p', 'app-sub', 'Step 2 — secure payment · ' + chosen.label));
            var sum = el('div', 'app-card');
            var row = el('div', 'app-row');
            row.appendChild(el('span', 'app-title grow', chosen.label));
            row.appendChild(el('span', 'co-price', currency + chosen.price));
            sum.appendChild(row);
            pane2.appendChild(sum);
            pane2.appendChild(el('div', 'co-card-input', '<span>💳</span> 4242 4242 4242 4242 &nbsp;·&nbsp; 12/28 &nbsp;·&nbsp; 313'));
            var methods = el('div', 'app-row');
            ['Card', 'Wallet', 'Cash on desk'].forEach(function (m, i) {
                methods.appendChild(el('span', 'app-badge ' + (i === 0 ? 'primary' : 'neutral'), m));
            });
            pane2.appendChild(methods);
            var act2 = el('div', 'co-actions');
            var payBtn = el('button', 'app-btn', 'Pay ' + currency + chosen.price);
            var back = el('button', 'app-btn subtle', 'Back');
            act2.appendChild(payBtn); act2.appendChild(back);
            pane2.appendChild(act2);
            back.addEventListener('click', function () { go(0); });
            payBtn.addEventListener('click', function () {
                payBtn.disabled = true;
                payBtn.textContent = 'Processing…';
                setTimeout(function () {
                    pane3.innerHTML = '';
                    var ok = el('div', 'co-success');
                    ok.appendChild(el('div', 'co-check', '✓'));
                    ok.appendChild(el('p', 'app-title', 'Registration confirmed'));
                    ok.appendChild(el('p', 'app-sub', chosen.label + ' · paid ' + currency + chosen.price + ' · receipt emailed, roster updated, finance ledger posted — automatically.'));
                    var again = el('button', 'app-btn ghost', 'Start over');
                    again.style.marginTop = '0.9rem';
                    again.addEventListener('click', function () { next1.disabled = true; pane1.querySelectorAll('.co-option').forEach(function (o) { o.classList.remove('selected'); }); go(0); });
                    ok.appendChild(again);
                    pane3.appendChild(ok);
                    go(2);
                }, 900);
            });
            go(1);
        });
    }

    /* ---------------- 4. Finance dashboard ---------------- */

    function initFinance(root) {
        var currency = root.getAttribute('data-currency') || '$';
        var kpis = el('div', 'app-row');
        kpis.style.gap = '0.7rem';
        kpis.style.alignItems = 'stretch';
        [['Collected this month', 24380, 'success'], ['Outstanding', 1640, 'warning'], ['Refunds', 220, 'neutral']].forEach(function (k) {
            var c = el('div', 'app-card grow');
            c.appendChild(el('p', 'app-sub', k[0]));
            var v = el('p', 'app-title count-up', currency + '0');
            v.setAttribute('data-count', String(k[1]));
            v.setAttribute('data-prefix', currency);
            v.style.fontSize = '1.25rem';
            c.appendChild(v);
            c.appendChild(el('span', 'app-badge ' + k[2], k[2] === 'success' ? '+12% vs last month' : k[2] === 'warning' ? '7 invoices' : '2 approved'));
            kpis.appendChild(c);
            if (typeof IntersectionObserver !== 'undefined') {
                var obs = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) { if (entry.isIntersecting) { animateCount(v); obs.unobserve(v); } });
                }, { threshold: 0.4 });
                obs.observe(v);
            } else { animateCount(v); }
        });
        root.appendChild(kpis);

        var chartCard = el('div', 'app-card');
        chartCard.style.marginTop = '0.7rem';
        chartCard.appendChild(el('p', 'app-sub', 'Revenue · last 12 weeks'));
        var chart = el('div', 'app-barchart');
        var heights = [34, 41, 38, 52, 47, 60, 55, 68, 64, 78, 83, 96];
        heights.forEach(function (h, i) {
            var bar = el('span', 'bar' + (i < heights.length - 4 ? ' dim' : ''));
            bar.style.height = '8px';
            chart.appendChild(bar);
            setTimeout(function () { bar.style.height = h + '%'; }, 150 + i * 70);
        });
        chartCard.appendChild(chart);
        root.appendChild(chartCard);

        var feed = el('div', 'app-card');
        feed.style.marginTop = '0.7rem';
        feed.appendChild(el('p', 'app-sub', 'Live order feed'));
        var list = el('div');
        feed.appendChild(list);
        root.appendChild(feed);
        var events = [
            ['Mia T.', 'Monthly subscription renewed', 'success', '+ ' + currency + '120'],
            ['Omar S.', 'Camp deposit · pay link', 'info', '+ ' + currency + '75'],
            ['Sara A.', 'Invoice issued · 2 sessions', 'warning', currency + '46'],
            ['Ivan P.', 'Wallet top-up', 'success', '+ ' + currency + '60']
        ];
        var idx = 0;
        function push() {
            var e = events[idx % events.length];
            idx++;
            var row = el('div', 'app-row');
            row.style.padding = '0.4rem 0';
            row.appendChild(avatar(e[0], true));
            var info = el('span', 'grow');
            info.appendChild(el('p', 'app-title', e[0]));
            info.appendChild(el('p', 'app-sub', e[1]));
            row.appendChild(info);
            row.appendChild(el('span', 'app-badge ' + e[2], e[3]));
            row.style.opacity = '0';
            row.style.transition = 'opacity 0.6s';
            list.insertBefore(row, list.firstChild);
            requestAnimationFrame(function () { row.style.opacity = '1'; });
            while (list.children.length > 3) list.removeChild(list.lastChild);
        }
        push(); push(); push();
        setInterval(push, 3200);
    }

    /* ---------------- 5. Trip itinerary player ---------------- */

    function initTrip(root) {
        var stops = pipeList(root, 'data-stops', [
            'Team hotel pickup|06:45 · 22 athletes · Bus A',
            'Practice rink|07:30 · warm-up block',
            'Main arena|09:15 · attendance auto-marked on board',
            'Return to hotel|13:40 · manifest closed'
        ]);
        var wrap = el('div');
        root.appendChild(wrap);
        var nodes = stops.map(function (s, i) {
            var parts = s.split('|');
            var stop = el('div', 'trip-stop');
            stop.appendChild(el('span', 'trip-dot'));
            var info = el('div', 'trip-info');
            info.appendChild(el('p', 'app-title', parts[0]));
            info.appendChild(el('p', 'app-sub', parts[1] || ''));
            var meta = el('div', 'trip-meta');
            meta.appendChild(el('span', 'app-badge neutral', 'Stop ' + (i + 1)));
            var state = el('span', 'app-badge info', 'Scheduled');
            meta.appendChild(state);
            info.appendChild(meta);
            stop.appendChild(info);
            wrap.appendChild(stop);
            return { node: stop, state: state };
        });

        var controls = el('div', 'lb-controls');
        var btn = el('button', 'app-btn', 'Start trip');
        var status = el('span', 'lb-status', 'Drivers get the manifest; parents get live status.');
        controls.appendChild(btn); controls.appendChild(status);
        root.appendChild(controls);

        var playing = false;
        btn.addEventListener('click', function () {
            if (playing) return;
            playing = true;
            btn.disabled = true;
            nodes.forEach(function (n) {
                n.node.classList.remove('done', 'current');
                n.state.className = 'app-badge info';
                n.state.textContent = 'Scheduled';
            });
            var i = 0;
            function step() {
                if (i > 0) {
                    nodes[i - 1].node.classList.remove('current');
                    nodes[i - 1].node.classList.add('done');
                    nodes[i - 1].state.className = 'app-badge success';
                    nodes[i - 1].state.textContent = 'Completed';
                }
                if (i >= nodes.length) {
                    playing = false;
                    btn.disabled = false;
                    btn.textContent = 'Replay trip';
                    status.textContent = 'Trip closed — attendance & mileage logged automatically.';
                    return;
                }
                nodes[i].node.classList.add('current');
                nodes[i].state.className = 'app-badge primary';
                nodes[i].state.textContent = 'En route';
                status.textContent = 'Live: ' + nodes[i].node.querySelector('.app-title').textContent;
                i++;
                setTimeout(step, 1300);
            }
            step();
        });
    }

    /* ---------------- 6. Ticket seat picker (roadmap preview) ---------------- */

    function initTicket(root) {
        var eventName = root.getAttribute('data-event') || 'Figure Skating World Cup · Finals';
        var priceStd = parseFloat(root.getAttribute('data-price') || '35');
        var priceVip = priceStd * 2.5;

        var ticket = el('div', 'ticket');
        var head = el('div', 'ticket-head');
        var headL = el('div');
        headL.appendChild(el('p', 'app-sub', 'E-TICKET'));
        headL.appendChild(el('p', 'app-title', eventName));
        head.appendChild(headL);
        head.appendChild(el('span', 'app-badge primary', 'GATE 2'));
        ticket.appendChild(head);
        var body = el('div', 'ticket-body');
        var seatInfo = el('div');
        seatInfo.appendChild(el('p', 'app-sub', 'Seat'));
        var seatLabel = el('p', 'app-title', 'Pick a seat below');
        seatInfo.appendChild(seatLabel);
        body.appendChild(seatInfo);
        var priceInfo = el('div');
        priceInfo.appendChild(el('p', 'app-sub', 'Total'));
        var priceLabel = el('p', 'app-title', '—');
        priceInfo.appendChild(priceLabel);
        body.appendChild(priceInfo);
        ticket.appendChild(body);
        var foot = el('div', 'ticket-foot');
        var bc = el('div', 'ticket-barcode');
        for (var i = 0; i < 28; i++) bc.appendChild(el('span'));
        foot.appendChild(bc);
        foot.appendChild(el('span', 'app-sub', '#VQ-2027-0481'));
        ticket.appendChild(foot);
        root.appendChild(ticket);

        var seats = el('div', 'seat-grid');
        seats.setAttribute('role', 'group');
        seats.setAttribute('aria-label', 'Interactive seat map preview');
        var selected = null;
        var rows = 5, colsN = 10;
        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < colsN; c++) {
                (function (r, c) {
                    var seat = el('button', 'seat');
                    var vip = r === 0;
                    var taken = ((r * 13 + c * 7) % 5 === 0) && !vip;
                    if (vip) seat.classList.add('vip');
                    if (taken) { seat.classList.add('taken'); seat.disabled = true; }
                    var label = String.fromCharCode(65 + r) + (c + 1);
                    seat.setAttribute('aria-label', 'Seat ' + label + (vip ? ' VIP' : '') + (taken ? ' taken' : ''));
                    seat.addEventListener('click', function () {
                        if (selected) selected.classList.remove('selected');
                        selected = seat;
                        seat.classList.add('selected');
                        seatLabel.textContent = 'Row ' + String.fromCharCode(65 + r) + ' · Seat ' + (c + 1) + (vip ? ' · VIP' : '');
                        priceLabel.textContent = '$' + (vip ? priceVip : priceStd).toFixed(2);
                    });
                    seats.appendChild(seat);
                })(r, c);
            }
        }
        root.appendChild(seats);
        root.appendChild(el('div', 'stage-line', 'Rink / Stage'));
    }

    /* ---------------- 7. Accreditation badge generator (roadmap preview) ---------------- */

    function initBadge(root) {
        var roles = {
            'Athlete':        { color: 'linear-gradient(90deg,#FF50DE,#7F00FF)', zones: ['FOP', 'WUP', 'ATH'] },
            'Coach':          { color: 'linear-gradient(90deg,#17A2B8,#007AFF)', zones: ['FOP', 'WUP', 'ATH', 'MED'] },
            'Judge / Official': { color: 'linear-gradient(90deg,#FFD66B,#FF9500)', zones: ['FOP', 'JUD', 'VIP'] },
            'Media':          { color: 'linear-gradient(90deg,#00E676,#16A085)', zones: ['MIX', 'PRS'] },
            'Medical':        { color: 'linear-gradient(90deg,#EF5350,#C0392B)', zones: ['FOP', 'WUP', 'ATH', 'MED'] }
        };
        var allZones = ['FOP', 'WUP', 'ATH', 'JUD', 'MED', 'MIX', 'PRS', 'VIP'];

        var wrap = el('div', 'demo-badge');
        var controls = el('div', 'badge-controls');
        var nameWrap = el('div');
        nameWrap.appendChild(el('label', null, 'Name'));
        var nameInput = el('input');
        nameInput.type = 'text';
        nameInput.value = 'Lena Kovaleva';
        nameInput.setAttribute('maxlength', '26');
        nameInput.setAttribute('aria-label', 'Credential holder name');
        nameWrap.appendChild(nameInput);
        controls.appendChild(nameWrap);
        var roleWrap = el('div');
        roleWrap.appendChild(el('label', null, 'Role'));
        var roleSelect = el('select');
        roleSelect.setAttribute('aria-label', 'Credential role');
        Object.keys(roles).forEach(function (r) {
            var o = el('option', null, r); o.value = r; roleSelect.appendChild(o);
        });
        roleWrap.appendChild(roleSelect);
        controls.appendChild(roleWrap);
        controls.appendChild(el('p', 'app-sub', 'Role drives colour-coding and zone access — printed and digital, scannable at every checkpoint.'));

        var badge = el('div', 'cred-badge');
        var photo = el('div', 'cred-photo', 'LK');
        var nm = el('p', 'cred-name', 'Lena Kovaleva');
        var rl = el('p', 'cred-role', 'Athlete');
        var zones = el('div', 'cred-zones');
        allZones.forEach(function (z) {
            zones.appendChild(el('span', 'cred-zone', z));
        });
        badge.appendChild(el('p', 'app-sub', 'WORLD CUP · OFFICIAL CREDENTIAL'));
        badge.appendChild(photo);
        badge.appendChild(nm);
        badge.appendChild(rl);
        badge.appendChild(zones);
        badge.appendChild(el('div', 'cred-qr'));

        wrap.appendChild(controls);
        wrap.appendChild(badge);
        root.appendChild(wrap);

        function render() {
            var name = nameInput.value.trim() || 'Your Name';
            var role = roleSelect.value;
            nm.textContent = name;
            rl.textContent = role;
            photo.textContent = name.split(/\s+/).map(function (s) { return s[0]; }).slice(0, 2).join('').toUpperCase();
            badge.style.setProperty('--badge-color', roles[role].color);
            zones.querySelectorAll('.cred-zone').forEach(function (z) {
                z.classList.toggle('granted', roles[role].zones.indexOf(z.textContent) !== -1);
            });
        }
        nameInput.addEventListener('input', render);
        roleSelect.addEventListener('change', render);
        render();
    }

    /* ---------------- 8. Progress rings ---------------- */

    function initProgress(root) {
        var metrics = pipeList(root, 'data-metrics', ['Attendance|92', 'Goal completion|78', 'Stage progress|64']);
        var svgNS = 'http://www.w3.org/2000/svg';
        var defs = document.createElementNS(svgNS, 'svg');
        defs.setAttribute('width', '0'); defs.setAttribute('height', '0');
        defs.style.position = 'absolute';
        defs.innerHTML = '<defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">' +
            '<stop offset="0%" stop-color="#FF50DE"/><stop offset="100%" stop-color="#7F00FF"/></linearGradient></defs>';
        root.appendChild(defs);

        var row = el('div', 'ring-row');
        root.appendChild(row);
        var rings = metrics.map(function (m) {
            var parts = m.split('|');
            var pct = parseInt(parts[1], 10) || 0;
            var item = el('div', 'ring-item');
            var svg = document.createElementNS(svgNS, 'svg');
            svg.setAttribute('class', 'ring');
            svg.setAttribute('viewBox', '0 0 92 92');
            var bg = document.createElementNS(svgNS, 'circle');
            bg.setAttribute('class', 'ring-bg');
            bg.setAttribute('cx', '46'); bg.setAttribute('cy', '46'); bg.setAttribute('r', '42');
            var val = document.createElementNS(svgNS, 'circle');
            val.setAttribute('class', 'ring-val');
            val.setAttribute('cx', '46'); val.setAttribute('cy', '46'); val.setAttribute('r', '42');
            svg.appendChild(bg); svg.appendChild(val);
            item.appendChild(svg);
            item.appendChild(el('div', 'ring-pct', pct + '%'));
            item.appendChild(el('div', 'ring-label', parts[0]));
            row.appendChild(item);
            return { val: val, pct: pct };
        });
        if ('IntersectionObserver' in window) {
            var pio = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    rings.forEach(function (r, i) {
                        setTimeout(function () {
                            r.val.style.strokeDashoffset = String(264 - (264 * r.pct / 100));
                        }, i * 200);
                    });
                    pio.unobserve(root);
                });
            }, { threshold: 0.4 });
            pio.observe(root);
        } else {
            rings.forEach(function (r) { r.val.style.strokeDashoffset = String(264 - (264 * r.pct / 100)); });
        }
    }

    /* ---------------- 9. Capacity meters (camps / cohorts) ---------------- */

    function initCapacity(root) {
        var items = pipeList(root, 'data-items', [
            'Week 1 · Foundations|18|24',
            'Week 2 · Intensive|24|24',
            'Week 3 · Elite prep|11|20'
        ]);
        items.forEach(function (it, i) {
            var parts = it.split('|');
            var used = parseInt(parts[1], 10), cap = parseInt(parts[2], 10);
            var full = used >= cap;
            var card = el('div', 'app-card');
            var row = el('div', 'app-row');
            var info = el('span', 'grow');
            info.appendChild(el('p', 'app-title', parts[0]));
            info.appendChild(el('p', 'app-sub', used + ' of ' + cap + ' spots filled'));
            row.appendChild(info);
            row.appendChild(el('span', 'app-badge ' + (full ? 'warning' : 'success'), full ? 'Waitlist open' : 'Enrolling'));
            card.appendChild(row);
            var prog = el('div', 'app-progress');
            prog.style.marginTop = '0.6rem';
            var span = el('span');
            span.style.width = '0%';
            prog.appendChild(span);
            card.appendChild(prog);
            root.appendChild(card);
            setTimeout(function () { span.style.width = Math.round(used / cap * 100) + '%'; }, 300 + i * 220);
        });
    }

    /* ---------------- Bootstrap all demos ---------------- */

    var INITS = {
        schedule: initSchedule,
        leaderboard: initLeaderboard,
        checkout: initCheckout,
        finance: initFinance,
        trip: initTrip,
        ticket: initTicket,
        badge: initBadge,
        progress: initProgress,
        capacity: initCapacity
    };
    document.querySelectorAll('[data-demo]').forEach(function (rootEl) {
        var kind = rootEl.getAttribute('data-demo');
        if (INITS[kind]) {
            try { INITS[kind](rootEl); } catch (e) { /* demo failure must never break the page */ }
        }
    });
})();
