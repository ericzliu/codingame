#include <iostream>
#include <string>
#include <vector>
#include <algorithm>
#include <unordered_set>
#include <sstream>

using namespace std;

string encode_word(string const & word, const string alphabet[]) {
    ostringstream os;
    for (auto & ch : word) {
        os << alphabet[int(ch - 'A')];
    }
    return os.str();
}

int main()
{
    const string ALPHABET[] = {
        ".-", // A
        "-...", // B
        "-.-.", // C
        "-..", // D
        ".", // E
        "..-.", // F
        "--.", // G
        "....", // H
        "..", // I
        ".---", // J
        "-.-", // K
        ".-..", // L
        "--", // M
        "-.", // N
        "---", // O
        ".--.", // P
        "--.-", // Q
        ".-.", // R
        "...", // S
        "-", // T
        "..-", // U
        "...-", // V
        ".--", // W
        "-..-", // X
        "-.--", // Y
        "--..", // Z
    };

    int M = 20;
    string L;
    cin >> L; cin.ignore();
    int N;
    cin >> N; cin.ignore();
    auto dict = unordered_multiset<string>();
    for (int i = 0; i < N; i++) {
        string W;
        cin >> W; cin.ignore();
        auto morse = encode_word(W, ALPHABET);
        dict.insert(morse);
        if (morse.size() > M) M = morse.size();
    }

    // cerr << dict.size() << endl;

    vector<long long> R(L.size() + 1, 0);
    R[L.size()] = 1u; // empty string has an interpretation
    for (int i = int(L.size() - 1); i >= 0; --i) {
        for (int j = i; j <= (i + M - 1) && j < L.size(); ++j) {
            string prefix = L.substr(i, j - i + 1);
            R[i] += long(dict.count(prefix) * R[j + 1]);
        }
        // cerr << "R[" << i << "]=" << R[i] << endl;
    }

    // Write an action using cout. DON'T FORGET THE "<< endl"
    // To debug: cerr << "Debug messages..." << endl;

    cout << R[0] << endl;
}
