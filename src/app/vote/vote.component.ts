import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {tap} from 'rxjs/operators';
import {Insurance} from '../insurance';
import {AngularFireStorage} from '@angular/fire/storage';
import {InsuranceService} from '../insurance.service';
import {Web3Service} from '../util/web3.service'

@Component({
    selector: 'app-vote',
    templateUrl: './vote.component.html',
    styleUrls: ['./vote.component.css']
})
export class VoteComponent implements OnInit {

    applicantName = '保険太郎';
    insuranceType = 'スマートフォン';
    insuranceFee = 500;
    deadline = '2019/06/08';
    depositFee = 0.01;


    insurance: Insurance;
    src: string;
    srcAfter: string;
    file: File;

    submittedUrl: string;

    id: string;

    constructor(
        private web3Service: Web3Service,
        private activatedRoute: ActivatedRoute,
        private angularFireStorage: AngularFireStorage,
        private insuranceService: InsuranceService
    ) {
    }

    ngOnInit() {
        this.activatedRoute.paramMap.subscribe(param => {
            const id = param.get('id');
            this.id = id;
            this.angularFireStorage.ref(id).getDownloadURL().pipe(
                tap(url => {
                    this.src = url;
                })
            ).subscribe();
            this.angularFireStorage.ref(id + 'after').getDownloadURL().pipe(
                tap(url => {
                    this.srcAfter = url;
                })
            ).subscribe();
            this.insuranceService.doc(id).get().subscribe(docRef => {
                const data = docRef.data();
                const start = new Date(data.start.seconds);
                const finish = new Date(data.finish.seconds);
                this.insurance = new Insurance({id: docRef.id, userId: data.userId, kind: data.kind, status: data.status, start, finish});
                if (this.insurance.status) {
                    console.log(this.insurance.id);
                    this.angularFireStorage.ref(this.insurance.id + 'after').getDownloadURL().subscribe(url => {
                        this.src = url;
                    });
                }
            });
        });
    }

    submitAcception() {
        this.web3Service.web3.eth.getAccounts().then(ids => {
            const address = ids[0];
            this.web3Service.web3.contract.methods.voteYesTo(address, this.id).send({
                from: address,
                value: 10000000000000000
            });
        });
    }

    submitRejection() {
        this.web3Service.web3.eth.getAccounts().then(ids => {
            const address = ids[0];
            this.web3Service.web3.contract.methods.voteNoTo(address, this.id).send({
                from: address,
                value: 10000000000000000
            });
        });
    }
}
