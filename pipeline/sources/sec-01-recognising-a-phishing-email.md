# Source note — Recognising a phishing email

Author's own note, written from public knowledge of how phishing works. No client or
employer material, no product names, no real organisations. This is the only permitted
input for generating lesson SEC-01.

**Why this note exists.** Every other lesson in this repository is medical insurance. The
claim made in the README — that the method is not tied to that domain — is worth nothing
unless the pipeline has actually been run against something else. This note is that test.
It was chosen to be as far from claims adjudication as a corporate training topic
reasonably gets.

Objective: **SEC-01** — given an email, identify the signals that distinguish a phishing
attempt from a legitimate message, and take the correct action.

---

Phishing does not attack software. It attacks the person reading the screen, which is why
a fully patched system with a well-trained attacker still loses. The defence is not a
tool; it is a habit of checking two or three things before acting.

The **display name** is the weakest signal in an email and the one people trust most. It
is free text. A sender can set it to anything — a colleague's name, a bank, an internal
department — and it will render exactly as typed. What cannot be set freely is the address
behind it. Reading the actual address, not the name shown, is the first check.

Addresses are attacked by resemblance. A **look-alike domain** is a registered domain
chosen to be misread rather than examined: a letter pair that resolves to another shape at
a glance, an added or removed hyphen, a different top-level domain on an otherwise correct
name. None of these are technical failures. They rely entirely on a reader scanning
instead of reading.

The same gap exists in links. The text of a link and its destination are independent —
displayed text is a label, and a label can say anything. Revealing the real destination
before following it (hovering on a desktop, long-pressing on a phone) turns a guess into a
check. A link whose visible text names one place and whose destination is another is not
ambiguous; it is the finding.

**Urgency is engineered, not incidental.** Deadlines measured in hours, threats of account
closure, a payment that must move before end of day, a manager who is in a meeting and
cannot be called — these exist to remove the pause in which checking would happen. Urgency
is not evidence of a scam on its own, but urgency combined with a request to act outside
the normal route is close to it.

Two requests should end the conversation regardless of how convincing everything else is.
The first is a password. Legitimate organisations do not ask for one by email; a service
that needs to authenticate someone sends them to its own login, it does not collect
credentials in a reply. The second is a one-time code. A one-time code exists precisely
because it is not supposed to be shareable, and the person asking for it — including
someone claiming to be internal support — is asking for the only thing standing between an
attacker and an account they already have the password for.

A **reply-to address that differs from the sending address** is worth noticing. It is a
legitimate feature and has ordinary uses, so it is not proof by itself. But in a message
that is also urgent and also asks for something unusual, it means a reply reaches someone
other than the apparent sender.

Attachments deserve the same suspicion as links, and for the same reason: the file name is
a label chosen by the sender. An unexpected attachment, especially one whose name implies
it must be opened to understand the email, is a request to run something.

The correct action is narrow and always the same. Do not click, do not reply, do not open
the attachment. Verify through a channel you already have — an address book entry, a phone
number you had before the email, the organisation's site typed rather than followed. Then
report it, because the same message almost never arrives at one person.

One thing worth stating plainly, because training often implies the opposite: being
deceived by a well-made phishing email is not a character failure, and treating it as one
is why people hide it. A report made in five minutes is recoverable. A click hidden for
two days usually is not. The goal of this lesson is not vigilance as a personality trait —
it is two checks, done quickly, before acting.
