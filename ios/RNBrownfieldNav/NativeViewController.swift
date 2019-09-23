//
//  NativeViewController.swift
//  RNBrownfieldNav
//
//  Created by Sal Randazzo on 9/20/19.
//  Copyright © 2019 Facebook. All rights reserved.
//

import UIKit


class NativeViewController: UIViewController {
  
  override func viewDidLoad() {
    view.backgroundColor = .white;
    
    let label = UILabel(frame: .zero);
    label.textAlignment = .center;
    label.text = "This is a ViewController created in Swift";
    self.view.addSubview(label)
    
    let button = UIButton(type: .custom);
    button.addTarget(self, action: #selector(pushNewViewController), for: .touchUpInside);
    button.setTitleColor(.blue, for: .normal);
    button.setTitle("Tap me to push a RN screen", for: .normal);
    view.addSubview(button);
  
    label.frame = CGRect(x: 0, y: 200, width: view.frame.width, height: 75);
    button.frame = CGRect(x: 0, y: 275, width: view.frame.width, height: 75);
  }
  
  @objc func pushNewViewController() {
    let homeScreenVC = ReactViewController(moduleName: "paperlesspost.HomeScreen");
    self.navigationController?.pushViewController(homeScreenVC, animated: true);
  }
}
